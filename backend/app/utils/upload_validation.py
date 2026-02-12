"""Upload validation: magic bytes, image dimensions, extension whitelist."""

from __future__ import annotations

import io

# Magic bytes (first few bytes) for allowed image types
ALLOWED_EXTENSIONS = frozenset({"jpg", "jpeg", "png", "gif", "webp"})

MAGIC_BYTES: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff", "jpeg"),
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"GIF87a", "gif"),
    (b"GIF89a", "gif"),
    (b"RIFF", "webp"),  # WebP starts with RIFF....WEBP
]

MAX_IMAGE_DIMENSION = 8192


def check_magic_bytes(data: bytes, content_type: str) -> bool:
    """Return True if data matches expected magic for content_type."""
    if not data:
        return False
    if "jpeg" in content_type or "jpg" in content_type:
        return data[:3] == b"\xff\xd8\xff"
    if "png" in content_type:
        return data[:8] == b"\x89PNG\r\n\x1a\n"
    if "gif" in content_type:
        return data[:6] in (b"GIF87a", b"GIF89a")
    if "webp" in content_type:
        return data[:4] == b"RIFF" and len(data) >= 12 and data[8:12] == b"WEBP"
    return False


def check_extension(filename: str | None) -> bool:
    """Return True if filename has an allowed extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[-1].lower()
    return ext in ALLOWED_EXTENSIONS


def check_image_dimensions(data: bytes, max_dimension: int = MAX_IMAGE_DIMENSION) -> tuple[bool, str | None]:
    """Return (True, None) if dimensions are within limit, else (False, error_message)."""
    try:
        from PIL import Image
        with Image.open(io.BytesIO(data)) as img:
            w, h = img.size
            if w > max_dimension or h > max_dimension:
                return False, f"Image dimensions {w}x{h} exceed maximum {max_dimension}x{max_dimension}"
    except Exception as e:
        return False, f"Invalid or corrupt image: {e}"
    return True, None
