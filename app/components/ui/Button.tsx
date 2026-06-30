interface Props{

children:React.ReactNode;

type?:"button"|"submit";

}

export default function Button({

children,

type="button"

}:Props){

return(

<button

type={type}

className="w-full bg-green-800 text-white py-3 rounded hover:bg-green-900 transition"

>

{children}

</button>

);

}