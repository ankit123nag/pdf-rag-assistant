'use client'
import * as React from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

const FileUploadComponent: React.FC = () => {

    // Clerk token
    const { getToken } = useAuth();

    const handleUploadFileClick = () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf');
        el.click();
        el.addEventListener('change', async (e) => {
            if (el.files && el.files.length) {
                const file = el?.files[0];
                // Clerk authentication
                const token = await getToken();
                if (file && token) {
                    const formData = new FormData();
                    formData.append('pdf', file);

                    await fetch('http://localhost:8000/upload', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    });
                }
            }
        })
    }
    return (
        <div className='text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2'>
            <div onClick={handleUploadFileClick} className='flex justify-center items-center flex-col cursor-pointer'>
                <h3>Upload PDF File</h3>
                <Upload />
            </div>
        </div>
    )
}

export default FileUploadComponent;