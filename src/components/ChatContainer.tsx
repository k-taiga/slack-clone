import ChatList from "./ChatContainer/ChatList";
import MessageArea from "./ChatContainer/MessageArea";

const ChatContainer = () => {
    return (
        <div className="flex grow h-screen">
            <ChatList/>
            <MessageArea/>
        </div>
    );
};

export default ChatContainer;