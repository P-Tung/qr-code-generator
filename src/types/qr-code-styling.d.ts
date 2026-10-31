declare module "qr-code-styling" {
  export type DotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
  export type CornerSquareType = "dot" | "square" | "extra-rounded" | DotType;
  export type CornerDotType = "dot" | "square" | DotType;
  export type FileExtension = "svg" | "png" | "jpeg" | "webp";
  export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface Options {
    type?: "canvas" | "svg";
    width?: number;
    height?: number;
    margin?: number;
    data?: string;
    image?: string;
    qrOptions?: { typeNumber?: number; mode?: string; errorCorrectionLevel?: ErrorCorrectionLevel };
    imageOptions?: { saveAsBlob?: boolean; hideBackgroundDots?: boolean; imageSize?: number; crossOrigin?: string; margin?: number };
    dotsOptions?: { type?: DotType; color?: string };
    cornersSquareOptions?: { type?: CornerSquareType; color?: string };
    cornersDotOptions?: { type?: CornerDotType; color?: string };
    backgroundOptions?: { color?: string; round?: number };
  }

  export default class QRCodeStyling {
    constructor(options?: Options);
    append(container?: HTMLElement): void;
    update(options?: Options): void;
    getRawData(extension?: FileExtension): Promise<Blob | null>;
  }
}
