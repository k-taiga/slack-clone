import {useAppDispatch} from "../../app/hooks";
import {selectChannel} from "../../features/channel/channelSlice";
import {Channel} from "../../type/Channel";

type Props = {
    channel: Channel
    id: string
}

const ChannelCell = ({channel, id}:Props) => {
    // store へ「こう変えてくれ」と伝えるための送信口（dispatch 関数）を取り出す。
    const dispatch = useAppDispatch();

    // クリックされたときに実行してほしい処理を、関数として用意しているだけ。ここでは実行していない。
    // 実行するのは下の onClick で、押された瞬間に React がこの関数を呼ぶ。
    // onClick={handleChannelName()} と書くと描画のたびに即実行され、
    // その dispatch が再描画を呼んでまた実行……と無限ループになる。だから「呼ばずに渡す」
    const handleChannelName = () => {
        // selectChannel(id) は state を書き換える処理ではなく、
        // 「currentChannelId を id にしたい」という要求を表すオブジェクトを作るだけ（action）。
        // それを dispatch へ渡して初めて channelSlice の reducer が動き、store の値が変わる。
        // 2 段階に分かれているおかげで、state を書き換えるコードが slice の中だけに集まる
        dispatch(selectChannel(id));
    }

    return (
        <div className="px-4 py-1 hover:bg-gray-700">
            <div
                className="text-gray-300 hover:text-white"
                onClick={handleChannelName}
            >
                # {channel.name}
            </div>
        </div>
    );
};

export default ChannelCell;