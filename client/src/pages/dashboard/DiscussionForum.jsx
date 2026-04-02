import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
  Edit,
  Pin,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

const DiscussionForum = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/forum?page=${page}&limit=5&search=${search}`
      );
      setPosts(data?.posts || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  // CREATE / UPDATE
const handleSubmitPost = async () => {
  if (!content.trim()) return;

  try {
    const formData = new FormData();
    formData.append("content", content);

    if (image) {
      formData.append("forumImage", image);
    }

    if (editingPost) {
      await api.put(`/forum/${editingPost}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingPost(null);
    } else {
      await api.post("/forum", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setContent("");
    setImage(null);
    setPreview(null);
    setShowForm(false);
    fetchPosts();
  } catch (error) {
    console.error(error);
  }
};

  const likePost = async (id) => {
    await api.post(`/forum/${id}/like`);
    fetchPosts();
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/forum/${id}`);
    fetchPosts();
  };

  const pinPost = async (id) => {
    await api.put(`/forum/${id}/pin`);
    fetchPosts();
  };

  const addReply = async (postId) => {
    if (!replyContent[postId]?.trim()) return;
    await api.post(`/forum/${postId}/reply`, {
      content: replyContent[postId],
    });
    setReplyContent((prev) => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  const deleteReply = async (postId, replyId) => {
    if (!window.confirm("Delete reply?")) return;
    await api.delete(`/forum/${postId}/reply/${replyId}`);
    fetchPosts();
  };

  const toggleReplies = (postId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-indigo-600" />
          <h1 className="text-2xl font-bold">Discussion Forum</h1>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingPost(null);
            setContent("");
            setImage(null);
            setPreview(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Start Discussion
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 mb-6 bg-white border rounded-lg px-3 py-2 shadow-sm">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search discussions..."
          className="w-full outline-none"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">
                {editingPost ? "Edit Discussion" : "New Discussion"}
              </h2>
              <X
                className="cursor-pointer"
                onClick={() => setShowForm(false)}
              />
            </div>

            <textarea
              rows="4"
              className="w-full border rounded-lg p-3"
              placeholder="Write your discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* IMAGE UPLOAD */}
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            {/* PREVIEW */}
            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="rounded-lg max-h-60 object-cover w-full"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPost}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                {editingPost ? "Update" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="py-20 flex justify-center w-full">
          <Loading message="Fetching the latest discussions..." />
        </div>
      )}

      {/* POSTS */}
      {!loading &&
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-white border rounded-xl p-5 mb-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.name}</h3>
                  {post.isPinned && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                      Pinned
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">
                  {post.role}
                </span>
              </div>

              <div className="flex gap-3">
                {user?.role === "admin" && (
                  <Pin
                    size={16}
                    className={`cursor-pointer ${
                      post.isPinned ? "text-yellow-500" : ""
                    }`}
                    onClick={() => pinPost(post._id)}
                  />
                )}

                {(user?._id === post.user ||
                  user?.role === "admin") && (
                  <>
                    <Edit
                      size={16}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingPost(post._id);
                        setContent(post.content);
                        setShowForm(true);
                      }}
                    />
                    <Trash2
                      size={16}
                      className="cursor-pointer text-red-500"
                      onClick={() => deletePost(post._id)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <p className="mt-4 text-gray-700">{post.content}</p>

            {/* IMAGE DISPLAY */}
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="mt-4 rounded-xl max-h-96 object-cover w-full border"
              />
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <button
                onClick={() => likePost(post._id)}
                className="flex items-center gap-1 hover:text-indigo-600"
              >
                <ThumbsUp size={16} />
                {post.likes?.length || 0}
              </button>

              <button
                onClick={() => toggleReplies(post._id)}
                className="flex items-center gap-1 text-gray-600"
              >
                {expandedReplies[post._id] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                {post.replies?.length || 0} Replies
              </button>
            </div>

            {/* REPLIES */}
            {expandedReplies[post._id] && (
              <div className="mt-5 space-y-3">
                {post.replies?.map((reply) => (
                  <div
                    key={reply._id}
                    className="bg-gray-50 p-3 rounded-lg border"
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">
                          {reply.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 capitalize">
                          {reply.role}
                        </span>
                      </div>

                      {(user?._id === reply.user ||
                        user?.role === "admin") && (
                        <Trash2
                          size={14}
                          className="cursor-pointer text-red-500"
                          onClick={() =>
                            deleteReply(post._id, reply._id)
                          }
                        />
                      )}
                    </div>
                    <p className="text-sm mt-1">{reply.content}</p>
                  </div>
                ))}

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    className="flex-1 border rounded-lg p-2"
                    value={replyContent[post._id] || ""}
                    onChange={(e) =>
                      setReplyContent((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => addReply(post._id)}
                    className="bg-indigo-600 text-white px-3 rounded-lg"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DiscussionForum;