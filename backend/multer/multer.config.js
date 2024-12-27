import multer from "multer";

const storage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image'))
        cb(null,true);
    else
        cb(new Error('Not an image!please upload only images'),false);
}

const upload=multer({
    storage:storage,
    fileFilter:multerFilter
});

export const uploadFile=(file)=>upload.single(file);