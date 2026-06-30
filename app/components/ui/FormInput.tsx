"use client";

import { useField } from "formik";
import Input from "./Input";

    interface Props{

    name:string;
    label:string;
    type?:string;
    placeholder?:string;

    }

    export default function FormInput({

    name,
    ...props

    }:Props){

    const [field,meta]=useField(name);

    return(

    <Input

    {...field}

    {...props}

    error={
    meta.touched && meta.error
    ? meta.error
    : undefined
    }

    />

    );

}