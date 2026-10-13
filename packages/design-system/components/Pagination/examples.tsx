import { useState } from "react";

import { Pagination } from "./Pagination";

export function ControlledPagination() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageCount={25} onPageChange={setPage} locale="zh" />;
}

export function LinkedPagination() {
  return <Pagination page={3} pageCount={25} getPageHref={(page) => `/search?page=${page}`} />;
}
