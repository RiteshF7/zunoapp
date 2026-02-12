"""Tests for file upload hardening: magic bytes, dimensions, extension whitelist."""

from unittest.mock import MagicMock, patch

import pytest


def test_upload_rejects_wrong_magic_bytes_but_correct_content_type(client, mock_db):
    """Upload with content-type image/jpeg but file content not JPEG is rejected."""
    # Send PNG magic bytes with .jpg filename and image/jpeg content-type
    png_magic = b"\x89PNG\r\n\x1a\n"
    rest = b"\x00" * 100
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("fake.jpg", png_magic + rest, "image/jpeg")},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 400
    data = response.json()
    assert "image" in data.get("error", "").lower() or "magic" in data.get("detail", "").lower() or "type" in data.get("error", "").lower()


def test_upload_rejects_disallowed_extension(client, mock_db):
    """Upload with non-whitelist extension (e.g. .bmp) is rejected."""
    jpeg_magic = b"\xff\xd8\xff"
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("image.bmp", jpeg_magic + b"\x00" * 200, "image/bmp")},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 400
    data = response.json()
    detail = (data.get("detail") or data.get("error") or "").lower()
    assert "extension" in detail or "allowed" in detail or "image" in detail


def test_upload_rejects_oversized_dimensions(client, mock_db):
    """Upload with image dimensions exceeding max (8192) is rejected."""
    import io
    from PIL import Image
    # Create a 100x100 PNG in memory
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    png_data = buf.getvalue()
    # Mock Image.open to return a 9000x9000 image so dimension check fails
    with patch("PIL.Image.open") as mock_open:
        mock_img = MagicMock()
        mock_img.size = (9000, 9000)
        mock_open.return_value.__enter__ = MagicMock(return_value=mock_img)
        mock_open.return_value.__exit__ = MagicMock(return_value=False)
        response = client.post(
            "/api/v1/content/upload",
            files={"file": ("large.png", png_data, "image/png")},
            headers={"Authorization": "Bearer test-token-123"},
        )
    assert response.status_code == 400
    data = response.json()
    detail = (data.get("detail") or data.get("error") or "").lower()
    assert "dimension" in detail or "size" in detail or "8192" in detail
