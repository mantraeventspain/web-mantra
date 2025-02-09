export function normalizeNickname(nickname: string): string {
  return nickname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
    .replace(/[^a-zA-Z0-9]+/g, "-") // Reemplazar caracteres especiales con guión, manteniendo mayúsculas
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final
}
