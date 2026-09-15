#[cfg(windows)]
use std::ffi::c_void;

/// Encrypt `token` with DPAPI, mirroring how the Steam client obfuscates the
/// stored refresh token, and return it as a lowercase hex string.
pub fn encrypt_token(token: &str, account_name: &str) -> Result<String, String> {
    let blob = protect(token.as_bytes(), account_name.as_bytes())?;
    Ok(blob.iter().map(|byte| format!("{byte:02x}")).collect())
}

/// Decrypt a hex-encoded DPAPI blob stored in Steam's ConnectCache.
pub fn decrypt_token(encrypted_hex: &str, account_name: &str) -> Result<String, String> {
    let data = decode_hex(encrypted_hex.trim())?;
    let blob = unprotect(&data, account_name.as_bytes())?;
    Ok(String::from_utf8_lossy(&blob)
        .trim_matches('\0')
        .trim()
        .to_string())
}

#[cfg(windows)]
fn protect(token: &[u8], account_name: &[u8]) -> Result<Vec<u8>, String> {
    // Steam tags the blob with this fixed UTF-16 description ("BObfuscateBuffer").
    const DESCRIPTION: &[u8] =
        b"B\x00O\x00b\x00f\x00u\x00s\x00c\x00a\x00t\x00e\x00B\x00u\x00f\x00f\x00e\x00r\x00\x00\x00";
    // CRYPTPROTECT_LOCAL_MACHINE (0x1) | CRYPTPROTECT_UI_FORBIDDEN (0x10).
    const FLAGS: u32 = 0x11;

    let mut token_bytes = token.to_vec();
    let mut entropy_bytes = account_name.to_vec();
    let description: Vec<u16> = String::from_utf8_lossy(DESCRIPTION)
        .encode_utf16()
        .chain(Some(0))
        .collect();

    let data_in = CryptBlob {
        cb_data: token_bytes.len() as u32,
        pb_data: token_bytes.as_mut_ptr(),
    };
    let entropy = CryptBlob {
        cb_data: entropy_bytes.len() as u32,
        pb_data: entropy_bytes.as_mut_ptr(),
    };
    let mut data_out = CryptBlob {
        cb_data: 0,
        pb_data: std::ptr::null_mut(),
    };

    // SAFETY: blobs point at live vectors for the duration of the call; `data_out`
    // is written by crypt32 and freed with `LocalFree`.
    let ok = unsafe {
        CryptProtectData(
            &data_in,
            description.as_ptr(),
            &entropy,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            FLAGS,
            &mut data_out,
        )
    };
    if ok == 0 {
        return Err("Failed to encrypt the account token.".to_string());
    }
    take_blob(data_out)
}

#[cfg(windows)]
fn unprotect(encrypted: &[u8], account_name: &[u8]) -> Result<Vec<u8>, String> {
    let mut data_bytes = encrypted.to_vec();
    let mut entropy_bytes = account_name.to_vec();

    let data_in = CryptBlob {
        cb_data: data_bytes.len() as u32,
        pb_data: data_bytes.as_mut_ptr(),
    };
    let entropy = CryptBlob {
        cb_data: entropy_bytes.len() as u32,
        pb_data: entropy_bytes.as_mut_ptr(),
    };
    let mut data_out = CryptBlob {
        cb_data: 0,
        pb_data: std::ptr::null_mut(),
    };

    // SAFETY: same lifetime rules as `protect`.
    let ok = unsafe {
        CryptUnprotectData(
            &data_in,
            std::ptr::null_mut(),
            &entropy,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            0,
            &mut data_out,
        )
    };
    if ok == 0 {
        return Err("Failed to decrypt the cached token.".to_string());
    }
    take_blob(data_out)
}

#[cfg(not(windows))]
fn protect(_token: &[u8], _account_name: &[u8]) -> Result<Vec<u8>, String> {
    Err("DPAPI is only available on Windows.".to_string())
}

#[cfg(not(windows))]
fn unprotect(_encrypted: &[u8], _account_name: &[u8]) -> Result<Vec<u8>, String> {
    Err("DPAPI is only available on Windows.".to_string())
}

#[cfg(windows)]
#[repr(C)]
struct CryptBlob {
    cb_data: u32,
    pb_data: *mut u8,
}

#[cfg(windows)]
fn take_blob(blob: CryptBlob) -> Result<Vec<u8>, String> {
    if blob.pb_data.is_null() {
        return Err("DPAPI returned an empty buffer.".to_string());
    }
    // SAFETY: crypt32 allocated `cb_data` bytes at `pb_data` on success.
    let bytes = unsafe { std::slice::from_raw_parts(blob.pb_data, blob.cb_data as usize) }.to_vec();
    free_blob(blob.pb_data);
    Ok(bytes)
}

#[cfg(windows)]
fn free_blob(ptr: *mut u8) {
    unsafe {
        LocalFree(ptr.cast::<c_void>());
    }
}

fn decode_hex(value: &str) -> Result<Vec<u8>, String> {
    if !value.len().is_multiple_of(2) {
        return Err("The cached token is not valid hex.".to_string());
    }
    let mut out = Vec::with_capacity(value.len() / 2);
    let bytes = value.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let high = from_hex_digit(bytes[i])?;
        let low = from_hex_digit(bytes[i + 1])?;
        out.push((high << 4) | low);
        i += 2;
    }
    Ok(out)
}

fn from_hex_digit(byte: u8) -> Result<u8, String> {
    match byte {
        b'0'..=b'9' => Ok(byte - b'0'),
        b'a'..=b'f' => Ok(byte - b'a' + 10),
        b'A'..=b'F' => Ok(byte - b'A' + 10),
        _ => Err("The cached token is not valid hex.".to_string()),
    }
}

#[cfg(windows)]
#[link(name = "crypt32")]
unsafe extern "system" {
    fn CryptProtectData(
        data_in: *const CryptBlob,
        description: *const u16,
        optional_entropy: *const CryptBlob,
        reserved: *mut c_void,
        prompt: *mut c_void,
        flags: u32,
        data_out: *mut CryptBlob,
    ) -> i32;

    fn CryptUnprotectData(
        data_in: *const CryptBlob,
        description: *mut *mut u16,
        optional_entropy: *const CryptBlob,
        reserved: *mut c_void,
        prompt: *mut c_void,
        flags: u32,
        data_out: *mut CryptBlob,
    ) -> i32;
}

#[cfg(windows)]
#[link(name = "kernel32")]
unsafe extern "system" {
    fn LocalFree(hmem: *mut c_void) -> *mut c_void;
}

#[cfg(test)]
mod tests {
    use super::decode_hex;

    #[test]
    fn decode_hex_reads_bytes() {
        assert_eq!(decode_hex("0aff").unwrap(), vec![0x0a, 0xff]);
    }

    #[test]
    fn decode_hex_rejects_odd_length() {
        assert!(decode_hex("abc").is_err());
    }
}
