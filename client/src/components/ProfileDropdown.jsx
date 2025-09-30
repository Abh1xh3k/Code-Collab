import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-primary/20"
        style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9qFzFB_z3PgGGhrzsF8FBUVlPiIEuZF87h-rdoGzxLcr1KDEfttcluYlsg2CLqyq7nj8vdoWkpEn9aaaIPOz0n1RLgDGKta__h9VelVNuaPBztn7SWHuxfED371KmAr6wSu2HJ35GMOfEeu_teGLMhgLmHA9lRNyY3sBk_NVoiG-nUl_iJdUcDhpS6gxAhbyLHbyfwpEmLxZab2UgwnjJkWh8b4OCQC9nGpc_v6CUb-f74ooK_kwYIZrHfeP19uYcsIV2L1IFA2s")`
        }}
      />
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg py-1 z-50">
          <button
            onClick={handleProfileClick}
            className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            Profile
          </button>
          <button
            onClick={() => {
             
              setIsOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;