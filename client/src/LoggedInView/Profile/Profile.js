import React, { useContext } from "react"
import dayjs from "dayjs"
import { Link, Redirect } from "react-router-dom"
import { avatarUrl, fetchWithToken, useAPI } from "../../utils/api.js"
import UserCard from "./UserCard.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import AuthContext from "../../context/AuthContext.js"


function PostActions(props) {
    const className = "ml-2 text-gray-700 hover:text-black"

    const [token, setToken] = useContext(AuthContext)

    const handleDelete = async () => {
        await fetchWithToken(`/posts/${props.id}`, token, setToken, {
            method: "DELETE"
        })

        props.onMutate(posts => posts.filter(post => post.id !== props.id), false)
    }

    const handleEdit = async () => {
        //
    }

    return (
        <div className="flex-grow text-right">
            <button className={className} onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
            <button className={className} onClick={handleEdit}>
                <FontAwesomeIcon icon={faPencilAlt} />
            </button>
        </div>
    )
}


function Post(props) {
    const { data: currentUser } = useAPI("/auth/status")
    const { data: author } = useAPI("/profile/:0", [props.authorId])

    const createdAt = dayjs(props.createdAt).fromNow()
    const editedAt = (props.editedAt !== props.createdAt) ? dayjs(props.editedAt).fromNow() : null

    return (
        <article className="rounded-2xl border-black border-2">
            <Link to={`/profile/${author?.id}`} className="border-b-2 border-black p-3 text-xl flex items-center gap-3">
                <img alt="" src={avatarUrl(author?.avatarHash, 64)} className="rounded-full h-8 w-8" />
                <span>{author?.name}</span>
            </Link>
            <div className="p-3">
                <h2 className="text-3xl mb-2">{props.title}</h2>
                <p>{props.content}</p>
            </div>
            <div className="text-gray-700 border-t-2 border-black p-3 flex gap-2">
                <span>created {createdAt}</span>
                {editedAt && <span>· last edited {editedAt}</span>}
                {props.authorId === currentUser.id && <PostActions id={props.id} onMutate={props.onMutate} />}
            </div>
        </article>
    )
}


function Feed(props) {
    return (
        <div className="max-w-xl mx-auto p-4">
            {props.posts?.map(post => <Post key={post.id} onMutate={props.onMutate} {...post} />)}
        </div>
    )
}


export default function Profile(props) {
    const { id } = props.match.params

    const { data: status } = useAPI("/auth/status")
    const { data } = useAPI("/profile/:0", [id === "@me" ? null : id])
    const { data: posts, mutate } = useAPI("/posts/user/:0", [id === "@me" ? null : id])

    if (id === "@me" && status) {
        return <Redirect to={`/profile/${status.id}`} />
    }

    if (data?.status_code === 404) {
        return (
            <div className="text-center text-xl m-4">
                <h1 className="text-3xl mb-4">profile not found</h1>
                <p>the requested user was not found.</p>
                <p>go <Link to="/" className="underline">home?</Link></p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto w-full">
            <UserCard user={data} />
            <Feed posts={posts} onMutate={mutate} />
        </div>
    )
}