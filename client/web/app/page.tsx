import FileUploadComponent from "./components/file-upload";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 font-sans">
      <div className="w-[30vw] min-h-screen flex items-center justify-center p-4">
          <FileUploadComponent />
      </div>
      <div className="w-[70vw] min-h-screen border-white border-l-2"></div>
    </div>
  );
}
