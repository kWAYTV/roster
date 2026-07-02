use windows::core::PCWSTR;
use windows::Win32::Security::Cryptography::{CryptProtectData, CRYPT_INTEGER_BLOB};

// Steam stores the refresh token as a DPAPI blob keyed by the account name as
// entropy and tagged with this fixed UTF-16 description ("BObfuscateBuffer").
const DESCRIPTION: &[u8] =
    b"B\x00O\x00b\x00f\x00u\x00s\x00c\x00a\x00t\x00e\x00B\x00u\x00f\x00f\x00e\x00r\x00\x00\x00";

// CRYPTPROTECT_LOCAL_MACHINE (0x1) | CRYPTPROTECT_UI_FORBIDDEN (0x10).
const FLAGS: u32 = 0x11;

/// Encrypt `token` with DPAPI, mirroring how the Steam client obfuscates the
/// stored refresh token, and return it as a lowercase hex string.
pub fn encrypt_token(token: &str, account_name: &str) -> Result<String, String> {
    let mut token_bytes = token.as_bytes().to_vec();
    let mut entropy_bytes = account_name.as_bytes().to_vec();

    let data_in = CRYPT_INTEGER_BLOB {
        cbData: token_bytes.len() as u32,
        pbData: token_bytes.as_mut_ptr(),
    };
    let entropy = CRYPT_INTEGER_BLOB {
        cbData: entropy_bytes.len() as u32,
        pbData: entropy_bytes.as_mut_ptr(),
    };

    let description: Vec<u16> = String::from_utf8_lossy(DESCRIPTION)
        .encode_utf16()
        .chain(Some(0))
        .collect();
    let mut data_out = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptProtectData(
            &data_in,
            PCWSTR(description.as_ptr()),
            Some(&entropy),
            None,
            None,
            FLAGS,
            &mut data_out,
        )
        .map_err(|_| "Failed to encrypt the account token.".to_string())?;

        let slice = std::slice::from_raw_parts(data_out.pbData, data_out.cbData as usize);
        let hex = slice.iter().map(|b| format!("{b:02x}")).collect::<String>();
        free_blob(data_out.pbData);
        Ok(hex)
    }
}

/// Release the buffer DPAPI allocated with `LocalAlloc`.
unsafe fn free_blob(ptr: *mut u8) {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn LocalFree(hmem: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    }
    LocalFree(ptr as *mut std::ffi::c_void);
}
