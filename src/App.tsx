import Login from './components/Login';
import Sidebar from "./components/Sidebar.tsx";
import ChatContainer from "./components/ChatContainer";
import {useAppSelector} from "./app/hooks.ts";
import useAuthState from "./features/auth/useAuthState";

function App() {
  // アプリケーションで自動ログイン機能を有効にする
  useAuthState();

  // store の state から userId だけを取り出す。
  // 渡した関数の戻り値が変わったときだけ、このコンポーネントが再描画される。
  // login / logout が dispatch されて state.user.userId が変われば、下の分岐がやり直される。
  const userId = useAppSelector((state) => state.user.userId);

  // return が返しているのは HTML ではなく JSX（React 要素を作る式）。
  // React はこの戻り値を見て画面を組み立てる。
  return (
    <div className="flex">
        {/*
          JSX の中括弧の中には JS の「式」だけを書ける（if 文などの「文」は書けない）ため、
          表示の出し分けは三項演算子で書く。

          userId は初期値が空文字で falsy 判定になる。
          未ログイン（空文字）ならログイン画面、ログイン済み（userId あり）ならチャット画面。
        */}
        {userId ? (
            // <> </> は Fragment。div などの余計な要素を増やさずに、複数の要素を 1 つにまとめて返す。
            <>
            <Sidebar />
            <ChatContainer />
            </>
        ): (
            <Login/>
        )}
    </div>
  );
}

export default App;
