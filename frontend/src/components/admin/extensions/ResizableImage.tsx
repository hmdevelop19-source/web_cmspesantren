import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useRef } from 'react';

const ResizableImageComponent = ({ node, updateAttributes, selected }: any) => {
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(node.attrs.width || 'auto');
  const imgRef = useRef<HTMLImageElement>(null);
  // Use a ref to track the latest width to avoid closure issues
  const widthRef = useRef(node.attrs.width || 'auto');

  useEffect(() => {
    const newWidth = node.attrs.width || 'auto';
    setWidth(newWidth);
    widthRef.current = newWidth;
  }, [node.attrs.width]);

  const onMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setResizing(true);

    const startX = event.clientX;
    const startWidth = imgRef.current?.clientWidth || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const newWidth = Math.max(50, startWidth + (currentX - startX));
      const widthPx = `${newWidth}px`;
      setWidth(widthPx);
      widthRef.current = widthPx;
    };

    const onMouseUp = () => {
      setResizing(false);
      updateAttributes({ width: widthRef.current });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper 
      className={`resizable-image-container relative leading-none max-w-full my-4 flex ${
        node.attrs.textAlign === 'center' ? 'justify-center' : 
        node.attrs.textAlign === 'right' ? 'justify-end' : 
        'justify-start'
      }`}
    >
      <div 
        className={`relative transition-shadow duration-300 ${selected ? 'ring-2 ring-primary ring-offset-2 z-10' : ''}`}
        style={{ width: width, maxWidth: '100%' }}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
          className="block w-full h-auto rounded-lg shadow-sm"
          style={{ width: '100%' }}
        />
        
        {selected && (
          <>
            {/* Resize Handle - Bottom Right */}
            <div
              onMouseDown={onMouseDown}
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-nwse-resize shadow-xl z-50 flex items-center justify-center hover:scale-125 transition-transform"
            >
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            
            {/* Overlay during resizing */}
            {resizing && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center rounded-lg pointer-events-none z-40">
                 <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl uppercase tracking-[0.2em] animate-in fade-in zoom-in duration-200">
                   {parseInt(width as string) || imgRef.current?.clientWidth} PX
                 </span>
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 'auto',
        parseHTML: element => element.getAttribute('width') || element.style.width || 'auto',
        renderHTML: attributes => {
          if (attributes.width === 'auto') return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
          };
        },
      },
      textAlign: {
        default: 'left',
        parseHTML: element => element.style.textAlign || element.getAttribute('data-align') || 'left',
        renderHTML: attributes => {
          if (attributes.textAlign === 'left') return {};
          
          let style = `text-align: ${attributes.textAlign};`;
          if (attributes.textAlign === 'center') {
            style += ' display: block; margin-left: auto; margin-right: auto;';
          } else if (attributes.textAlign === 'right') {
            style += ' display: block; margin-left: auto; margin-right: 0;';
          }

          return { 
            style,
            'data-align': attributes.textAlign 
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
