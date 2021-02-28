import React, { useEffect, useCallback, useState, useRef } from "react";
import useDebounce from "./hooks/useDebounce";
import ImageCard from "./components/ImageCard";
import ImageCardSkeleton from "./components/ImageCardSkeleton";

function App() {
  const [images, setImages] = useState({ imagesArray: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const wrapperRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetch(
      `https://pixabay.com/api/?key=${process.env.REACT_APP_PIXABAY_API_KEY}&per_page=24&q=${debouncedSearchTerm}&safesearch=true`
    )
      .then((response) => response.json())
      .then((data) => {
        setImages({ imagesArray: data.hits });
        setIsLoading(false);
        setCurrentPage(1);
      })
      .catch((error) => console.log(error));
  }, [debouncedSearchTerm]);

  useEffect(() => {
    window.onscroll = () => {
      if (wrapperRef)
        setIsScrolledToBottom(
          wrapperRef.current.scrollHeight - window.scrollY === window.innerHeight
        );
    };
  }, [wrapperRef]);

  const fetchImages = useCallback(() => {
    fetch(
      `https://pixabay.com/api/?key=${process.env.REACT_APP_PIXABAY_API_KEY}&page=${
        currentPage + 1
      }&per_page=24&q=${debouncedSearchTerm}`
    )
      .then((response) => response.json())
      .then((data) => {
        setImages({ imagesArray: [...images.imagesArray, ...data.hits] });
        setCurrentPage((value) => value + 1);
      })
      .catch((error) => console.log(error));
  }, [currentPage, debouncedSearchTerm, images]);

  useEffect(() => {
    if (isScrolledToBottom) fetchImages();
    setIsScrolledToBottom(false);
  }, [fetchImages, isScrolledToBottom]);

  return (
    <div ref={wrapperRef}>
      <div className="container md:p-7 p-2 mx-auto">
        <input
          type="text"
          name="search"
          id="search"
          className="w-full py-2 px-6 mb-4 bg-gray-200 rounded-md"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="grid align-middle grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {isLoading
            ? [...Array(4)].map((_, index) => <ImageCardSkeleton key={index} />)
            : images.imagesArray.map((image, index) => <ImageCard key={index} image={image} />)}
        </div>
      </div>
    </div>
  );
}

export default App;
