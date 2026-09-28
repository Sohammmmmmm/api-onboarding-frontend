export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center px-4 sm:min-h-[250px]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
