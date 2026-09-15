"use client";

const Loader = () => {
  return (
    <div className="flex min-h-[200px] w-full items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
    </div>
  );
};

export default Loader;
