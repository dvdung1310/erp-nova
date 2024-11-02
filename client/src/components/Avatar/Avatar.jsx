import React from 'react'
import {PiUserCircle} from "react-icons/pi";

const Avatar = ({name, imageUrl, width, height}) => {

    let avatarName = ""

    if (name) {
        const splitName = name?.split(" ")

        if (splitName.length > 1) {
            avatarName = splitName[0][0] + splitName[1][0]
        } else {
            avatarName = splitName[0][0].toUpperCase()
        }
    }

    const bgColor = [
        '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    ];

    const randomNumber = () => {
        return bgColor[Math.floor(Math.random() * bgColor.length)]
    }

    return (
        <div className='text-gray-500 rounded fw-bold position-relative user-select-none overflow-hidden'
             role='button'
             style={{width: `${width}px`, height: `${height}px`}}>
            {
                imageUrl ? (
                    <img
                        src={imageUrl}
                        loading="lazy"
                        alt={name}
                        style={{
                            display: 'block',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            overflow: 'hidden',
                            width: `${width}px`,
                            height: `${height}px`,
                        }}
                    />
                ) : (
                    name ? (
                        <div style={{
                            width: `${width}px`, height: `${height}px`,
                            fontSize: `${width / 2}px`,
                            backgroundColor: `${randomNumber()}`,
                            borderRadius: '50%',
                            fontWeight: 'bold',
                        }}
                             className="overflow-hidden rounded rounded-circle d-flex justify-content-center align-items-center">
                            {avatarName}
                        </div>
                    ) : (
                        <PiUserCircle
                            size={width}
                        />
                    )
                )
            }

        </div>
    )
}

export default Avatar
