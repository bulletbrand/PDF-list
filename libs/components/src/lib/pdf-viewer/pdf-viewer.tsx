import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  PdfViewerError,
  PdfViewerHeader,
  PdfViewerLoading,
  PdfViewerZoomButtons,
} from './components';
import { useMeasureRenderTime } from './hooks/useMeasureRenderTime';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import styles from './pdf-viewer.module.scss';
import { getPagesFromNumber } from './utils/common';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export interface IPdfViewerProps {
  filePath: string;
}

/*
  To combine virtual list with the gesture library (drag zoom), we need a self-written solution
  to calculate the coordinates of the crop inside the container for zoom to work properly, which
  might involve overengineering in the context of this task
 */
export function PdfViewer({ filePath }: IPdfViewerProps) {
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pages, setPages] = useState<number[]>([]);

  const { renderTime, updateRenderTime } = useMeasureRenderTime();

  const onDocumentLoadSuccess = ({ numPages }: pdfjs.PDFDocumentProxy) => {
    updateRenderTime();
    setPages(getPagesFromNumber(numPages));
  };

  if (pdfLoadError) return <PdfViewerError />;

  return (
    <TransformWrapper initialScale={1}>
      {({ zoomIn, zoomOut }) => (
        <div className={styles.wrapper}>
          <PdfViewerHeader filePath={filePath} renderTime={renderTime} />
          <PdfViewerZoomButtons onZoomIn={zoomIn} onZoomOut={zoomOut} />
          <div className={styles.documentContainer}>
            <TransformComponent wrapperClass={styles.transformDocumentWrapper}>
              <Document
                loading={<PdfViewerLoading />}
                className={styles.document}
                file={filePath}
                onLoadError={() => setPdfLoadError(true)}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                {pages.map((page) => (
                  <Page key={page} pageNumber={page} />
                ))}
              </Document>
            </TransformComponent>
          </div>
        </div>
      )}
    </TransformWrapper>
  );
}

export default PdfViewer;
