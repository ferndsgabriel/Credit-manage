import { IoCardOutline } from "react-icons/io5";


function Loading(){
    return(
        <div
        className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen p-24 bg-dark1">
            <div className="flex items-center justify-center w-24 border-2 border-b-0 border-l-0 border-solid rounded-full aspect-square animate-spin">
                <IoCardOutline
                className="text-2xl animate-spin-reverse"/>
            </div>
        </div>
    )
}

export default Loading;