import { Skeleton } from "@yami/design-system/components/Skeleton";
import { renderToStaticMarkup } from "react-dom/server";

export function renderDocsLoading() {
  return renderToStaticMarkup(
    <div className="sb-preparing-docs yami-docs-loading" aria-hidden="true">
      <div className="yami-docs-loading__content">
        <div className="yami-docs-loading__header">
          <Skeleton className="yami-docs-loading__title" />
          <Skeleton className="yami-docs-loading__description" />
        </div>
        <div className="yami-docs-loading__example">
          <div className="yami-docs-loading__preview">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
          <div className="yami-docs-loading__code">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
        <div className="yami-docs-loading__usage">
          <Skeleton />
          <Skeleton />
        </div>
      </div>
      <div className="yami-docs-loading__toc">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>,
  );
}
