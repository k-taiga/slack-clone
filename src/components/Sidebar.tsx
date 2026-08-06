import { Home, ChatBubble } from "@mui/icons-material";
import {useAppSelector} from "../app/hooks.ts";
import {useEffect, useState} from "react";
import {getUser} from "../features/user/userAPI";
import {User} from "../type/User";

const Sidebar = () => {
    // 引数に渡した関数（selector）が state 全体を受け取り、必要な一部だけを返す。
    // 返した値が変わったときだけ再描画されるので、state.user.userId 以外が変わっても影響を受けない。
    const userId = useAppSelector((state) => state.user.userId);

    // useState は [現在の値, 更新関数] の 2 要素配列を返し、それを分割代入で受け取っている。
    // <User | null> は「この state に入る型」の指定。
    // 初期値を渡していないため最初は undefined で、型は User | null | undefined になる
    //（42 行目が user?.displayName とオプショナルチェーンなのはこのため）。
    const [user, setUser] = useState<User | null>();

    // useEffect(実行する関数, 依存配列)。描画が終わったあとに第 1 引数の関数が実行される。
    // 第 2 引数の [userId] は再実行の条件で、userId が前回と変わったときだけもう一度動く。
    // ログイン前後で userId が空文字 → uid に変われば、ここが再実行されて Firestore を取りに行く。
    useEffect(() => {
        // useEffect のコールバック自体には async を付けられない。
        // async 関数は Promise を返すが、useEffect の戻り値は後片付け用の関数として扱われるため。
        // そのため内側に async 関数を定義し、それを呼ぶ形にする。
        const fetchUser = async() => {
            // userId が空文字（未ログイン）のときは Firestore を呼ばない。
            if(userId) {
                // await で Promise の解決を待ち、取得結果そのものを受け取る。
                const userRef = await getUser(userId);
                // getUser はドキュメントが無いと undefined を返すので、あったときだけ state を更新する。
                if (userRef) {
                    setUser(userRef);
                }
            }
        };

        fetchUser();
        // userIdが依存配列で実行の条件、これが変わる度に実行される
    }, [userId]);

    return (
        <div className="w-16 py-3 h-screen bg-gray-900 flex flex-col items-center text-white">
            <div className="py-5 flex flex-col items-center">
                <div className="bg-gray-700 p-2 rounded-lg">
                    <Home/>
                </div>
                <span className="text-xs">Home</span>
            </div>
            <div className="py-5 flex flex-col items-center">
                <div className="bg-gray-700 p-2 rounded-lg">
                    <ChatBubble/>
                </div>
                <span className="text-xs">DM</span>
            </div>
            <div className="py-5 mt-auto mx-2 flex flex-col items-center">
                <div className="bg-gray-700 p-2 rounded-lg">
                    <img src={"/default-user-icon.png"} alt=""/>
                </div>
                <span className="text-xs" >{user?.displayName}</span>
            </div>
        </div>
    );
};

export default Sidebar;