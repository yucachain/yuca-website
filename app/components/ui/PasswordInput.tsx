"use client";

import { useState } from "react";
import { useField } from "formik";

export default function PasswordInput({

    name,
    label

}:{

name:string;
label:string;

}){

const [show,setShow]=useState(false);

const [field,meta]=useField(name);

return(

<div className="space-y-1">

<label>{label}</label>

<div className="relative">

<input

    {...field}

    type={show ? "text":"password"}

    className={`w-full border rounded px-3 py-2 ${
        meta.touched && meta.error
        ? "border-red-500"
        :"border-gray-300"
    }`}

/>

<button

type="button"

onClick={()=>setShow(!show)}

className="absolute right-3 top-2"

>

{show?"Hide":"Show"}

</button>

</div>

{meta.touched && meta.error &&(

<p className="text-red-500 text-sm">

{meta.error}

</p>

)}

</div>

);

}