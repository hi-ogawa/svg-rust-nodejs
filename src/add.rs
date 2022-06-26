use napi_derive;

// for quick debugging of napi workflow

#[napi_derive::napi]
pub fn add(x: i32, y: i32) -> i32 {
    x + y
}
