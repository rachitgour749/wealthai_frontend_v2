import React from 'react';

// Generate consistent color based on user's name
const getAvatarColor = (name) => {
    if (!name) return '#8B5CF6'; // Default violet color

    // Simple hash function to generate consistent color from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color with good saturation and lightness
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 55%)`;
};

// Get first letter of user's name
const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
};

const UserAvatar = ({ user, size = 'small' }) => {
    const dimensions = size === 'small' ? 'w-[26px] h-[26px]' : 'w-[60px] h-[60px]';
    const fontSize = size === 'small' ? 'text-xs' : 'text-2xl';
    const borderClass = size === 'small' ? 'border-2' : 'ring-3 ring-white ring-offset-1 ring-offset-gray-50';
    const shadowClass = size === 'small' ? 'shadow-md' : 'shadow-[0_4px_12px_rgba(139,92,246,0.25)]';

    const bgColor = getAvatarColor(user?.name);

    return (
        <div
            className={`${dimensions} rounded-full flex items-center justify-center ${fontSize} font-bold text-white ${shadowClass} ${borderClass} border-white`}
            style={{ backgroundColor: bgColor }}
        >
            {user?.picture ? (
                <img
                    src={user.picture}
                    alt={user.name}
                    className='w-full h-full rounded-full object-cover'
                />
            ) : (
                <span>{getInitial(user?.name)}</span>
            )}
        </div>
    );
};

export default UserAvatar;
