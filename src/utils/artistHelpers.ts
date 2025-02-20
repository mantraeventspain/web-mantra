import { supabase } from '../lib/supabase';

interface ArtistAvatarOptions {
  normalizedNickname: string;
}

export async function getArtistAvatarUrl({ normalizedNickname }: ArtistAvatarOptions) {
  try {
    // Usar normalizedNickname para la ruta de archivos
    const { data: files, error } = await supabase.storage.from('media').list(`artist/${normalizedNickname}`, {
      limit: 10,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      console.error('Error listing files:', error);
      return null;
    }

    // Buscar el archivo que comience con 'avatar.'
    const avatarFile = files?.find((file) => file.name.startsWith('avatar.'));

    if (!avatarFile) {
      return null;
    }

    // Construir el path completo con la extensión correcta
    const path = `artist/${normalizedNickname}/${avatarFile.name}`;
    const { data } = supabase.storage.from('media').getPublicUrl(path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    return null;
  }
}

export async function uploadArtistAvatar(file: File, normalizedNickname: string): Promise<string | null> {
  try {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const tempFileName = `temp_${Date.now()}.${extension}`;
    const finalFileName = `avatar.${extension}`;
    const artistPath = `artist/${normalizedNickname}`;

    // 1. Subir con nombre temporal
    const { error: uploadError } = await supabase.storage.from('media').upload(`${artistPath}/${tempFileName}`, file);

    if (uploadError) throw uploadError;

    // 2. Listar archivos para encontrar el avatar anterior
    const { data: files, error: listError } = await supabase.storage.from('media').list(artistPath, {
      limit: 10,
      search: 'avatar.',
    });

    if (listError) throw listError;

    // 3. Eliminar avatar anterior si existe
    if (files && files.length > 0) {
      const { error: deleteError } = await supabase.storage.from('media').remove([`${artistPath}/${files[0].name}`]);

      if (deleteError) throw deleteError;
    }

    // 4. Renombrar el archivo temporal al nombre final
    const { error: moveError } = await supabase.storage
      .from('media')
      .move(`${artistPath}/${tempFileName}`, `${artistPath}/${finalFileName}`);

    if (moveError) throw moveError;

    return finalFileName;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}
