import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Avatar from './Avatar';
import { HiDotsVertical } from 'react-icons/hi';
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from 'react-icons/fa6';
import uploadFile from '../helpers/uploadFile';
import { IoClose } from 'react-icons/io5';
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';
import { IoMdSend } from 'react-icons/io';
import moment from 'moment';

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);

  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the message list when new messages arrive
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  useEffect(() => {
    if (!socketConnection) return;

    // Request initial data when the component mounts
    socketConnection.emit('message-page', params.userId);
    socketConnection.emit('seen', params.userId);

    const handleUserData = (data) => setDataUser(data);
    const handleLoadMessages = (messages) => setAllMessage(messages);
    const handleNewMessage = (newMessage) => {
      setAllMessage((prevMessages) => {
        const exists = prevMessages.some((msg) => msg._id === newMessage._id);
        return exists ? prevMessages : [...prevMessages, newMessage];
      });
    };

    socketConnection.on('message-user', handleUserData);
    socketConnection.on('load-messages', handleLoadMessages);
    socketConnection.on('message', handleNewMessage);

    return () => {
      socketConnection.off('message-user', handleUserData);
      socketConnection.off('load-messages', handleLoadMessages);
      socketConnection.off('message', handleNewMessage);
    };
  }, [socketConnection, params.userId, user]);

  const handleUploadImageVideoOpen = () => setOpenImageVideoUpload((prev) => !prev);

  const handleUploadFile = async (file, type) => {
    setLoading(true);
    try {
      const uploadResponse = await uploadFile(file);
      setMessage((prev) => ({
        ...prev,
        [`${type}Url`]: uploadResponse.url,
      }));
    } catch (error) {
      console.error('Error uploading file:', error.message);
    } finally {
      setLoading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        const newMessage = {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
          createdAt: new Date().toISOString(),
          _id: `${user?._id}-${Date.now()}`, // Temporary ID for optimistic update
        };

        setAllMessage((prevMessages) => [...prevMessages, newMessage]);
        socketConnection.emit('new message', newMessage);

        setMessage({
          text: '',
          imageUrl: '',
          videoUrl: '',
        });
      }
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <Avatar
            width={50}
            height={50}
            imageUrl={dataUser?.profile_pic}
            name={dataUser?.name}
            userId={dataUser?._id}
          />
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>}
            </p>
          </div>
        </div>
        <button className='cursor-pointer hover:text-primary'>
          <HiDotsVertical />
        </button>
      </header>

      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'}`}
            >
              <div className='w-full relative'>
                {msg?.imageUrl && <img src={msg?.imageUrl} className='w-full h-full object-scale-down' alt='uploaded' />}
                {msg?.videoUrl && <video src={msg.videoUrl} className='w-full h-full object-scale-down' controls />}
              </div>
              <p className='px-2'>{msg.text}</p>
              <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
            </div>
          ))}
        </div>

        {message.imageUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={() => setMessage((prev) => ({ ...prev, imageUrl: '' }))}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <img src={message.imageUrl} alt='uploaded' className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' />
            </div>
          </div>
        )}

        {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={() => setMessage((prev) => ({ ...prev, videoUrl: '' }))}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <video src={message.videoUrl} className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' controls muted autoPlay />
            </div>
          </div>
        )}

        {loading && (
          <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
            <Loading />
          </div>
        )}
      </section>

      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative'>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>

          {openImageVideoUpload && (
            <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
              <form>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                  <FaImage size={18} />
                  <span className='text-sm'>Upload Image</span>
                  <input type='file' id='uploadImage' accept='image/*' className='hidden' onChange={(e) => handleUploadFile(e.target.files[0], 'image')} />
                </label>
                <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                  <FaVideo size={18} />
                  <span className='text-sm'>Upload Video</span>
                  <input type='file' id='uploadVideo' accept='video/*' className='hidden' onChange={(e) => handleUploadFile(e.target.files[0], 'video')} />
                </label>
              </form>
            </div>
          )}
        </div>

        <form className='w-full flex'>
          <input
            type='text'
            value={message.text}
            onChange={handleOnChange}
            placeholder='Type your message...'
            className='w-full h-11 rounded-full border border-slate-300 px-4'
          />
          <button onClick={handleSendMessage} className='flex justify-center items-center w-12 h-12 rounded-full hover:bg-primary hover:text-white'>
            <IoMdSend size={20} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
