import {ChangeEvent, KeyboardEvent, useEffect, useState} from 'react';
import {TextareaAutosize} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {MessageRef} from "../../type/Message";
import {useAppSelector} from "../../app/hooks";
import {createMessage, subscribeMessages, postMessage} from "../../features/message/messageAPI";
import MessageTile from "./MessageTile";

const MessageArea = () => {
    const [messageRefs, setMessageRefs] = useState<MessageRef[]>([]);
    // reduxからuserIdを取得
    const userId = useAppSelector((state) => state.user.userId);
    const channelId :string = useAppSelector(state => state.channel.currentChannelId);

    const [message, setMessage] = useState('');
    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    const sendMessage = async() => {
        if(userId) {
            try {
                await postMessage(createMessage(userId, channelId, message));
                setMessage('');
            } catch (error) {
                console.log('Error:', error);
            }
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.code === "Enter") {
            sendMessage();
        }
    }

    // useEffect関数でchannelIdに変更があったら更新をする
    useEffect(() => {
        // subscribeMessages関数を呼び出してメッセージの更新を購読しそれを止める関数を取得
        const unsubscribe = subscribeMessages(channelId, (messageRefs) => {
            // 描画側にもセットする
            setMessageRefs(messageRefs);
        })
        return () => {
            // 購読が終わったのでunsubscribe関数を呼び出す
            unsubscribe();
        };
    }, [channelId]);

    return (
        <div className="flex-1 flex flex-col bg-gray-500 text-white">
            <div className="p-4 m-3 overflow-y-auto">
                {messageRefs.map((messageRef) => (
                    <MessageTile message={messageRef.message} key={messageRef.id}/>
                ))}
            </div>

            <div className="mt-auto px-4 py-2 bottom-0 bg-gray-900">
                <div className="flex items-center">
                    <TextareaAutosize
                        placeholder="メッセージを入力"
                        className="flex-1 bg-gray-700 text-white p-2 mx-2 rounded-lg focus:outline-none"
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        value={message}
                    />
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={sendMessage}
                    >
                        <SendIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;