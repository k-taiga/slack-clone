import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// react-redux の useDispatch / useSelector に、この store 専用の型を付けたラッパー。
// コンポーネントからは素の useDispatch / useSelector ではなくこちらを使う。
//
// withTypes で型を固定しておくと、
//   useAppDispatch: dispatch に渡せる action が userSlice などの action に絞られる
//   useAppSelector: 引数の state が RootState 扱いになり state.user.userId が補完される
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
