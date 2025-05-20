import { BadRequestException } from '@nestjs/common';

export function transformKeyToEnum<
  T extends Record<string, string | number>,
>(chaveEnum: string, enumObj: T): string | number | undefined {
  if (chaveEnum in enumObj) {
    return enumObj[chaveEnum as keyof T];
  } else {
    throw new BadRequestException(
      `Os valores aceitos devem ser ${Object.entries(enumObj)
        .map(([key]) => key)
        .join(', ')}`,
    );
  }
}

export function transformEnumToKey<
  T extends Record<string, string | number>,
>(valorRecebido: string | number, enumObj: T): T[keyof T] {
  const chave = Object.keys(enumObj).find(
    key => key.toUpperCase() === String(valorRecebido).toUpperCase()
  );
  if (chave !== undefined) {
    return enumObj[chave as keyof T];
  } else {
    throw new BadRequestException(
      `Os valores aceitos devem ser ${Object.keys(enumObj).join(', ')}` 
    );
  }
}