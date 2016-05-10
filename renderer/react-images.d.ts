declare module 'react-images' {
    import React = __React;
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
    export default class Lightbox extends React.Component<LightboxProps, {}> {}
}

