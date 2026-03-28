export function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) return 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)'
  return null
}

export function validateVideo(file) {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!allowedTypes.includes(file.type)) return 'Chỉ chấp nhận file video (MP4, WEBM, OGG)'
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) return 'Video không được vượt quá 50MB'
  return null
}
