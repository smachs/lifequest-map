import { ActionIcon, Group, Image, Input, Text } from '@mantine/core';
import type { DropzoneProps } from '@mantine/dropzone';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconX } from '@tabler/icons-react';
import { useEffect } from 'react';

type ImageDropzoneProps = Omit<DropzoneProps, 'children'> & {
  src?: string | null;
  onClear: () => void;
};
export default function ImageDropzone({
  src,
  onClear,
  onDrop,
  ...props
}: ImageDropzoneProps) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) {
        return;
      }
      for (const item of event.clipboardData.items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (!file) {
            continue;
          }
          onDrop([file]);
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onDrop]);

  return (
    <Input.Wrapper
      label="Screenshot (optional)"
      sx={() => ({
        position: 'relative',
      })}
    >
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        onDrop={onDrop}
        sx={{
          background: 'none',
          ':hover': {
            background: 'none',
          },
        }}
        {...props}
      >
        <Group
          position="center"
          spacing="xs"
          style={{ minHeight: 190, pointerEvents: 'none' }}
        >
          {src ? (
            <Image
              src={src}
              alt=""
              imageProps={{ onLoad: () => URL.revokeObjectURL(src) }}
            />
          ) : (
            <>
              <IconPhoto width={80} height={80} />
              <div>
                <Text size="xl" inline>
                  Paste, drag image here or click to select file
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  The image should not exceed 5mb
                </Text>
              </div>
            </>
          )}
        </Group>
      </Dropzone>
      {src && (
        <ActionIcon
          onClick={onClear}
          sx={() => ({
            position: 'absolute',
            top: 0,
            right: 0,
          })}
        >
          <IconX />
        </ActionIcon>
      )}
    </Input.Wrapper>
  );
}
