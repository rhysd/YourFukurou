declare module ReactImages {
    export import React = __React;
    export interface LightboxImage {
        src?: string;
        srcset?: string[];
    }
    export interface LightboxProps extends React.Props<Lightbox> {
        images: LightboxImage[];
        onClickPrev: () => void;
        onClickNext: () => void;
        onClose: () => void;
        backdropClosesModal?: boolean;
        enableKeyboardInput?: boolean;
        currentImage?: number;
        isOpen?: boolean;
        showCloseButton?: boolean;
        width?: number;
    }
    export class Lightbox extends React.Component<LightboxProps, {}> {}
}

declare module 'react-images' {
    export = ReactImages.Lightbox;
}
