//! Hide the main window from screen capture on Windows.

use std::ffi::c_void;

const WDA_NONE: u32 = 0x0000_0000;
const WDA_EXCLUDEFROMCAPTURE: u32 = 0x0000_0011;

pub fn set_exclude_from_capture(hwnd: isize, exclude: bool) -> bool {
    let affinity = if exclude {
        WDA_EXCLUDEFROMCAPTURE
    } else {
        WDA_NONE
    };
    unsafe {
        SetWindowDisplayAffinity(hwnd as *mut c_void, affinity) != 0
    }
}

#[cfg(windows)]
#[link(name = "user32")]
unsafe extern "system" {
    fn SetWindowDisplayAffinity(hwnd: *mut c_void, affinity: u32) -> i32;
}

#[cfg(not(windows))]
unsafe fn SetWindowDisplayAffinity(_hwnd: *mut c_void, _affinity: u32) -> i32 {
    0
}
