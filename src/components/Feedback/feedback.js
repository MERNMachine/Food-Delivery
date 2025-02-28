import React, { useState, useEffect } from "react";
import "../style/Feedback/feedback.css";
import toastr from "toastr";
import { getMenuDetail } from "../../api/Menus/apiGetMenu";
import { apiPostFeed } from "../../api/Feedback/apiPostFeedBack";

toastr.options = {
  closeButton: true, // Add a close button
  debug: false,
  newestOnTop: true,
  progressBar: true, // Add a progress bar
  positionClass: "toast-top-right", // Position: top-right corner
  preventDuplicates: true,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "3000", // Notification disappears after 3 seconds
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

const Feedback = ({ menuId, feedBacks = [] }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state
  const CustomRating = ({ rating, setRating }) => {
    const handleStarClick = (index) => {
      if (setRating) {
        setRating(index + 1);
      }
    };
    useEffect(() => {
      setComments(feedBacks);
  
    }, []);
    return (
      <div className="rating-container">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`star ${index < rating ? "filled" : ""}`}
            onClick={() => handleStarClick(index)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  // const fetchFeedBacks = async() =>{
  //   try {
  //     const data = await getMenuDetail(menuId);
  //     setItems(data);
  //     setLoading(false);
  //   } catch (err) {
  //     setLoading(false);
  //   }
  // }
  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") {
      toastr.warning("Comment cannot be empty!");
      return;
    }
    if (rating == 0) {
      toastr.warning("Please select a rating!");
      return;
    }
    const feedback = {
      comments: newComment,
      rating: rating,
    };
    try {
      await apiPostFeed(menuId, feedback);
      toastr.success("Successfully Submitted ");
      setNewComment("");
      setRating(0);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toastr.warning(err.response.data.msg); // Now correctly displays the message
      } else {
        toastr.warning("Something went wrong!");
      }
      setLoading(false);
    }
  };
  return (
    <div className="comment-section">
      <h2>Customer Reviews</h2>
      {comments.length === 0 ? (
        <p className="no-review">No comments yet. Be the first to leave a review!</p>
      ) : (
        comments.map((comment, index) => (
          <div key={index} className="comment">
            <CustomRating rating={comment.rating} />
            <p>{comment.comments}</p>
             {comment.user_id.firstName &&(<p className="review-name">{comment.user_id.firstName}</p>)}
          </div>
        ))
      )}

      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your review..."
        ></textarea>
        <CustomRating rating={rating} setRating={setRating} />
        <button onClick={handleCommentSubmit}>Submit Review</button>
      </div>
    </div>
  );
};
export default Feedback;
