import React, { useState } from 'react';
import { RiFolderCloseFill } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        profile_pic: ""
    });
    const [uploadPhoto, setUploadPhoto] = useState("");
    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => {
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        const uploadPhoto = await uploadFile(file);
        setUploadPhoto(file);

        setData((prev) => {
            return {
                ...prev,
                profile_pic: uploadPhoto?.url
            };
        });
    };

    const handleClearUploadPhoto = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setUploadPhoto(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;
        try {
            const response = await axios.post(URL, data);
            toast.success(response.data.message);

            if (response.data.success) {
                setData({
                    name: "",
                    email: "",
                    password: "",
                    profile_pic: ""
                });
                navigate('/email');  // Redirect to the email verification page after successful registration
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    return (
        <div className='mt-20'>
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 md:mx-auto'>
                <h3>Welcome to Chat-App!</h3>

                <form className='grid gap-4 mt-5' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='name'> Name : </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            placeholder='Enter your Name'
                            className='bg-slate-100 px-2 py-1 focus:outline-primary'
                            value={data.name}
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-1 mt-2'>
                        <label htmlFor='email'> Email : </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            placeholder='Enter your Email'
                            className='bg-slate-100 px-2 py-1 focus:outline-primary'
                            value={data.email}
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-1 mt-2'>
                        <label htmlFor='password'> Password : </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Enter your Password'
                            className='bg-slate-100 px-2 py-1 focus:outline-primary'
                            value={data.password}
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='profile_pic'> Profile Picture :
                            <div className='h-14 bg-slate-200 flex justify-center items-center border hover:border-primary cursor-pointer'>
                                <p className='text-sm max-w-[200] text-ellipsis line-clamp-1'>
                                    {uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"}
                                </p>
                                {uploadPhoto?.name && (
                                    <button>
                                        <RiFolderCloseFill className='text-lg ml-3 hover:text-red-600' onClick={handleClearUploadPhoto} />
                                    </button>
                                )}
                            </div>
                        </label>
                        <input
                            type='file'
                            id='profile_pic'
                            name='profile_pic'
                            className='bg-slate-100 px-2 py-1 focus:outline-primary hidden'
                            onChange={handleUploadPhoto}
                        />
                    </div>

                    <button
                        className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-4 font-bold text-white leading-relaxed tracking-wide'
                    >
                        Register
                    </button>

                </form>
                <p className='mt-3 text-center'>Already have account? <Link to={"/email"} className='hover:text-primary hover:underline font-semibold'>Login</Link></p>
            </div>
        </div>
    );
};

export default RegisterPage;
