// JSON Converter for 123hdtv to MovieStream format

// Function to fix malformed JSON and convert to MovieStream format
function convert123hdtvToMovieStream(rawJsonString) {
    try {
        // Fix JSON syntax issues
        let fixedJson = rawJsonString.trim();
        
        // Add opening bracket if missing
        if (!fixedJson.startsWith('[')) {
            fixedJson = '[' + fixedJson;
        }
        
        // Add closing bracket if missing
        if (!fixedJson.endsWith(']')) {
            fixedJson = fixedJson + ']';
        }
        
        // Fix missing commas between objects
        fixedJson = fixedJson.replace(/}\s*{/g, '},{');
        
        // Remove trailing commas before closing braces
        fixedJson = fixedJson.replace(/,\s*}/g, '}');
        
        // Parse the fixed JSON
        const movies123hdtv = JSON.parse(fixedJson);
        
        // Convert to MovieStream format
        const movieStreamContent = movies123hdtv.map((movie, index) => {
            // Extract year from title if year field is empty
            let year = movie.year;
            if (!year) {
                const yearMatch = movie.name.match(/\((\d{4})\)/);
                year = yearMatch ? yearMatch[1] : '';
            }
            
            // Generate unique ID
            const id = movie.name.toLowerCase()
                .replace(/[^a-z0-9ก-๙\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            
            // Generate description based on title
            const description = generateDescription(movie.name);
            
            // Determine genres based on title keywords
            const genres = determineGenres(movie.name);
            
            // Clean title (remove year and parentheses)
            const cleanTitle = movie.name.replace(/\s*\(\d{4}\)\s*/, '');
            
            return {
                id: id,
                type: "movie",
                title: cleanTitle,
                titleTh: cleanTitle,
                description: description,
                descriptionTh: description,
                year: year,
                genre: genres,
                genreTh: genres,
                rating: "7.0", // Default rating
                poster: movie.thumbnail,
                videoUrl: movie.video_url,
                duration: "1:45:00", // Default duration
                info: movie.info || "พากย์ไทย"
            };
        });
        
        // Remove duplicates based on title
        const uniqueMovies = removeDuplicates(movieStreamContent);
        
        return {
            content: uniqueMovies
        };
        
    } catch (error) {
        console.error('Error converting JSON:', error);
        return { content: [] };
    }
}

// Generate description based on title patterns
function generateDescription(title) {
    const horrorKeywords = ['ผี', 'สยอง', 'ฆาตกร', 'ตาย', 'ผี', 'สุสาน', 'อาถรรพ์'];
    const romanceKeywords = ['รัก', 'love', 'หวาน', 'โรแมนติก'];
    const actionKeywords = ['แอ็คชั่น', 'บู๊', 'สู้', 'ยิง', 'แข่ง'];
    const comedyKeywords = ['ตลก', 'ฮา', 'กวน', 'ตลกๆ'];
    
    const lowerTitle = title.toLowerCase();
    
    if (horrorKeywords.some(keyword => lowerTitle.includes(keyword))) {
        return 'หนังสยองขวัญที่น่าตื่นเต้นและน่ากลัว';
    } else if (romanceKeywords.some(keyword => lowerTitle.includes(keyword))) {
        return 'หนังโรแมนติกรักที่อบอุ่นหัวใจ';
    } else if (actionKeywords.some(keyword => lowerTitle.includes(keyword))) {
        return 'หนังแอ็คชั่นสุดมันส์ที่เต็มไปด้วยฉากแอ็คชั่น';
    } else if (comedyKeywords.some(keyword => lowerTitle.includes(keyword))) {
        return 'หนังตลกที่จะทำให้คุณหัวเราะได้ตลอดเวลา';
    } else {
        return 'หนังที่น่าสนใจและควรดู';
    }
}

// Determine genres based on title keywords
function determineGenres(title) {
    const genres = [];
    const lowerTitle = title.toLowerCase();
    
    // Horror/Thriller
    if (['ผี', 'สยอง', 'ฆาตกร', 'ตาย', 'สุสาน', 'อาถรรพ์', 'วิญญาณ'].some(keyword => lowerTitle.includes(keyword))) {
        genres.push('สยองขวัญ', 'ระทึก');
    }
    
    // Romance
    if (['รัก', 'love', 'หวาน', 'โรแมนติก'].some(keyword => lowerTitle.includes(keyword))) {
        genres.push('โรแมนติก', 'ดราม่า');
    }
    
    // Action
    if (['แอ็คชั่น', 'บู๊', 'สู้', 'ยิง', 'แข่ง', 'เสือ', 'แข่ง'].some(keyword => lowerTitle.includes(keyword))) {
        genres.push('แอ็คชั่น', 'ผจญภัณฑ์');
    }
    
    // Comedy
    if (['ตลก', 'ฮา', 'กวน', 'ตลกๆ', 'ฮัก'].some(keyword => lowerTitle.includes(keyword))) {
        genres.push('ตลก');
    }
    
    // Drama (default if no specific genre found)
    if (genres.length === 0) {
        genres.push('ดราม่า');
    }
    
    return genres;
}

// Remove duplicate movies based on title
function removeDuplicates(movies) {
    const seen = new Set();
    return movies.filter(movie => {
        const titleKey = movie.titleTh.toLowerCase().trim();
        if (seen.has(titleKey)) {
            return false;
        }
        seen.add(titleKey);
        return true;
    });
}

// Function to load and convert the 123hdtv JSON file
async function loadAndConvert123hdtv() {
    try {
        // For now, we'll use the hardcoded data from the file
        const rawJsonData = `[
  {
   "name": "Death Whisperer 3 (2025) ธี่หยด 3",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Death-Whisperer-3-2025-ธี่หยด-3.png",
   "video_url": "https://main.24playerhd.com/newplaylist/abd82a71ec04762c078c4432/abd82a71ec04762c078c4432.m3u8",
   "year": ""
  },
  {
   "name": "Deaw Still Alive (2026) เดี่ยว สตีล อะไลฟ์",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2026/01/Deaw-Still-Alive-2026-เดี่ยว-สตีล-อะไลฟ์.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/fb24105d68f2b4f428909236/fb24105d68f2b4f428909236.m3u8",
   "year": ""
  },
  {
   "name": "Nak Loves Mak Sooo Much! (2025) นากรักมาก ม๊ากมาก",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2026/01/Nak-Loves-Mak-Sooo-Much-2025-นากรักมาก-ม๊ากมาก.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/6c339de755ba0da8ce2a546b/6c339de755ba0da8ce2a546b.m3u8",
   "year": ""
  },
  {
   "name": "Nancy Boy (2025) เทย ไทบ้านเดอะซีรีส์",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/12/Nancy-Boy-2025-เทย-ไทบ้านเดอะซีรีส์.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/4d77f3b73ba528477a7ff508/4d77f3b73ba528477a7ff508.m3u8",
   "year": ""
  },
  {
   "name": "A Useful Ghost (2025) ผีใช้ได้ค่ะ",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/12/A-Useful-Ghost-2025-ผีใช้ได้ค่ะ.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/93e0208822dbfb20dc2a0a5c/93e0208822dbfb20dc2a0a5c.m3u8",
   "year": ""
  },
  {
   "name": "Slice (2009) เฉือน",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2022/12/Slice-2009-เฉือน.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/82c118cb2af352eaf4e9bcb0/82c118cb2af352eaf4e9bcb0.m3u8",
   "year": ""
  },
  {
   "name": "4 Tigers (2025) เสือ",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/11/4-Tigers-2025-เสือ.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/d312b81f2d633c82a1af7e7f/d312b81f2d633c82a1af7e7f.m3u8",
   "year": ""
  },
  {
   "name": "Ha Gom The Darkness Of The Soul (2025) ห่าก้อม",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/09/Ha-Gom-The-Darkness-Of-The-Soul-2025-ห่าก้อม.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/7597b4efca4da85cb9764341/7597b4efca4da85cb9764341.m3u8",
   "year": ""
  },
  {
   "name": "Attack 13 (2025) วิญญาณเลขที่ 13",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Attack-13-2025-วิญญาณเลขที่-13.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/ebb0871d5179d604d93e1669/ebb0871d5179d604d93e1669.m3u8",
   "year": ""
  },
  {
   "name": "Everybody Loves Me When I'm Dead (2025) ลักกันวันตาย",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Everybody-Loves-Me-When-Im-Dead-2025-ลักกันจนตาย.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/d4a6c8f931c2f1be2c106ab7/d4a6c8f931c2f1be2c106ab7.m3u8",
   "year": ""
  },
  {
   "name": "Baby Hero (2025) ฮีโร่บ้านทุ่ง",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Baby-Hero-2025-ฮีโร่บ้านทุ่ง.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/e5f0f133ac12b09301ac2eb7/e5f0f133ac12b09301ac2eb7.m3u8",
   "year": ""
  },
  {
   "name": "Serpent Beauty (2025) สาปอสรพิษ",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Serpent-Beauty-2025-สาปอสรพิษ.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/02d2507ed3bf296fc862a833/02d2507ed3bf296fc862a833.m3u8",
   "year": ""
  },
  {
   "name": "The Legend Of Phi-Ta-Khon-Mask (2025) ตำนานหน้ากากผีตาโขน",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/The-Legend-Of-Phi-Ta-Khon-Mask-2025-ตำนานหน้ากากผีตาโขน.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/135e6c47dff2a5a7688e5f94/135e6c47dff2a5a7688e5f94.m3u8",
   "year": ""
  },
  {
   "name": "Immortal Species (2023) อมตะพันธุ์สยอง",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/10/Immortal-Species-2023-อมตะพันธุ์สยอง.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/8d6b6ba22856181ea1758c7b/8d6b6ba22856181ea1758c7b.m3u8",
   "year": ""
  },
  {
   "name": "Same Day with Someone (2025) ซ้ำวัน กับ Someone",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/09/Same-Day-with-Someone-2025-ซ้ำวัน-กับ-Someone.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/19c9db89d42ce27d892210c8/19c9db89d42ce27d892210c8.m3u8",
   "year": ""
  },
  {
   "name": "The Sixth Sense (1999) ซิกซ์เซ้นส์...สัมผัสสยอง",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2023/02/The-Sixth-Sense-1999-ซิกซ์เซ้นส์...สัมผัสสยอง.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/389172bcfe828f009128ca23/389172bcfe828f009128ca23.m3u8",
   "year": ""
  },
  {
   "name": "The Sixth Sense (1999) ซิกซ์เซ้นส์...สัมผัสสยอง",
   "info": "ซับไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2023/02/The-Sixth-Sense-1999-ซิกซ์เซ้นส์...สัมผัสสยอง.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/389172bcfe828f009128ca23/389172bcfe828f009128ca23.m3u8",
   "year": ""
  },
  {
   "name": "Jazz The Racing (2025) หลวงพี่แจ๊สโคตรซิ่ง",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/09/Jazz-The-Racing-2025-หลวงพี่แจ๊สโคตรซิ่ง.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/c34830e45532a88473657bfc/c34830e45532a88473657bfc.m3u8",
   "year": ""
  },
  {
   "name": "Tomb Watcher (2025) สุสานคนเป็น",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/09/Tomb-Watcher-2025-สุสานคนเป็น.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/8c1c87e94f7a90d562376db3/8c1c87e94f7a90d562376db3.m3u8",
   "year": ""
  },
  {
   "name": "Kayaor (2025) คายอ้อ ลบหลู่ ศรัทธา อาถรรพ์",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/Kayaor-2025-คายอ้อ-ลบหลู่-ศรัทธา-อาถรรพ์.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/3d434992f9ed7019f5fa5c78/3d434992f9ed7019f5fa5c78.m3u8",
   "year": ""
  },
  {
   "name": "Gold Rush Gang (2025) เขาชุมทอง คะนองชุมโจร",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/Gold-Rush-Gang-2025-เขาชุมทอง-คะนองชุมโจร.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/e3cf7b53ee83d191ee3c3c6c/e3cf7b53ee83d191ee3c3c6c.m3u8",
   "year": ""
  },
  {
   "name": "Tha Rae The Exorcist (2025) ท่าแร่",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/Tha-Rae-The-Exorcist-2025-ท่าแร่.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/dd7d3db252acca508c9d5c6f/dd7d3db252acca508c9d5c6f.m3u8",
   "year": ""
  },
  {
   "name": "Halabala (2025) ฮาลาบาลา ป่าจิตหลุด",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/Halabala-2025-ฮาลาบาลา-ป่าจิตหลุด.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/d9d9d1f7f521fb0512be1103/d9d9d1f7f521fb0512be1103.m3u8",
   "year": ""
  },
  {
   "name": "Love or Lie (2025)  ฮักสัปปะลี่กับคดีสีชมพู",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/Love-or-Lie-2025-ฮักสัปปะลี่กับคดีสีชมพู.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/e8c28e528ca69f92def2b345/e8c28e528ca69f92def2b345.m3u8",
   "year": ""
  },
  {
   "name": "VIP Death Seat (2024) รถทัวร์วีไอผี",
   "info": "พากย์ไทย",
   "thumbnail": "https://www.123hdtv.com/wp-content/uploads/2025/08/VIP-Death-Seat-2024-รถทัวร์วีไอผี.png",
   "description": "",
   "video_url": "https://main.24playerhd.com/newplaylist/9b6fa5afb648403468c370a0/9b6fa5afb648403468c370a0.m3u8",
   "year": ""
  }
]`;
        
        const convertedData = convert123hdtvToMovieStream(rawJsonData);
        return convertedData;
        
    } catch (error) {
        console.error('Error loading 123hdtv data:', error);
        return { content: [] };
    }
}

// Export functions for use in main.js
window.JsonConverter = {
    convert123hdtvToMovieStream,
    loadAndConvert123hdtv,
    generateDescription,
    determineGenres,
    removeDuplicates
};
