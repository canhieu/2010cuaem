# Asset provenance

## Official character artwork

Character assets are copied unchanged from the public official Chiikawa anime website. They remain transparent PNG images and retain the original character art. Chiikawa characters belong to their respective rights holders. This project is a personal fan gift and does not represent an official Chiikawa product.

| Local file | Public source | Dimensions |
| --- | --- | --- |
| `dist/assets/chiikawa.png` | https://www.anime-chiikawa.jp/images/bg_top_chiikawa_01.png | 220 × 244 |
| `dist/assets/hachiware.png` | https://www.anime-chiikawa.jp/images/bg_top_hachiware_01.png | 245 × 258 |
| `dist/assets/usagi.png` | https://www.anime-chiikawa.jp/images/bg_top_usagi_01.png | 318 × 319 |
| `dist/assets/trio.png` | https://images.squarespace-cdn.com/content/v1/6670add926f2a64cd00fb0e7/79c73550-1408-45d2-8d8f-ca17f8b5bc3c/trio.png?format=1500w | 768 × 768 |

## Postal cottage hero

`dist/assets/post-office.png` is an original illustration generated with the built-in image generation tool using the official trio as a character identity reference. `dist/assets/post-office.webp` is the same illustration, encoded as WebP at quality 88 for web delivery. No visual content was altered during encoding. Both images are 1536 × 1024 pixels. The generated original remains in the session's generated_images directory.

Generation prompt:

> Use case: illustration-story. Create a brand-new wide landscape illustration (approximately 1536x1024, 3:2) for a Vietnamese romantic gift website called a tiny post office. The attached image is ONLY a character identity reference: faithfully depict Chiikawa (white rounded tiny ears), Hachiware (white face, blue cap marking and pointed ears), Usagi (pale butter yellow, long upright ears). All three retain their iconic large expressive glossy dark eyes, tiny mouths, blush cheeks and chubby small proportions. Scene: the three friends are preparing a little love letter delivery in front of a tiny blush-pink wooden postal cottage on a small grassy knoll. Chiikawa shyly holds a pink heart-sealed envelope near the front; Hachiware carries a blue satchel full of envelopes and gives a reassuring smile; Usagi excitedly presents a small yellow parcel tied with a pink ribbon. The cottage has a round door, a small pink striped awning and heart ornament; red-pink standalone mailbox beside it; a few tiny daisies, gently fluttering envelopes, two soft clouds. Editorial children's picturebook with delicate warm brown rounded outlines, soft flat pastel watercolor and pencil texture on ivory cream paper (#FFF8EF); pink peach, powder blue, butter yellow, sage green. Airy composition, scene concentrated in middle and lower area, wide cream breathing room around edges so asset sits beautifully on a cream webpage. Cohesive hand drawn 2D illustration, charming and polished, gentle daylight. NO text anywhere, no letters, no labels, no numbers, no logos, no UI mockup, no watermark, no borders, no photorealism, no 3D.

## Typography

Nunito variable font weights 400–900 were downloaded from the Google Fonts CSS endpoint https://fonts.googleapis.com/css2?family=Nunito:wght@400..900&display=swap. The project stores the Vietnamese, Latin and Latin Extended WOFF2 subsets locally. `dist/assets/fonts.css` contains their exact font-face and unicode-range declarations with relative local file URLs. `dist/assets/Nunito-OFL.txt` contains the original SIL Open Font License from https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt.

## Public voice and animation previews

Three short audio previews and their matching animated PNGs were obtained from the public preview metadata of [LINE Store product 37825](https://store.line.me/stickershop/product/37825/ja), 『映画ちいかわ 人魚の島のひみつ』第２弾. The page identifies the publisher as QTORY inc. and displays the credit ©nagano / 2026 Chiikawa the Movie Film Partners. The page and preview metadata were retrieved on 2026-10-20. Each pair shares the same sticker ID in the page's `soundUrl` and `animationUrl` fields.

This website is an independent personal fan gift. It is not an official Chiikawa website or product. This source record does not establish or grant a reuse licence, and public preview availability is not a claim that the assets are public domain or royalty-free. The selected files were fetched as ordinary public previews without login, paid download, region bypass or DRM bypass. The audio files are unchanged; no voice cloning, synthesis, pitch modification or other audio editing was applied.

| Character association | Sticker ID | Local audio | Audio duration | Local animation | APNG dimensions and frames |
| --- | --- | --- | --- | --- | --- |
| Chiikawa | `898125159` | `dist/assets/voices/chiikawa.m4a` | 2.136236 seconds | `dist/assets/motions/chiikawa.png` | 350 × 300; 11 frames |
| Hachiware, shown in the centre of the trio | `898125141` | `dist/assets/voices/hachiware.m4a` | 2.136236 seconds | `dist/assets/motions/hachiware.png` | 370 × 300; 18 frames |
| Usagi | `898125144` | `dist/assets/voices/usagi.m4a` | 3.134694 seconds | `dist/assets/motions/usagi.png` | 340 × 300; 16 frames |

All audio files use AAC, mono, 44100 Hz. Audio file sizes are 25714, 31779 and 28366 bytes respectively. Animation file sizes are 321438, 707342 and 325116 bytes respectively.

| Sticker ID | Audio source | Animation source |
| --- | --- | --- |
| `898125159` | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125159/android/sticker_sound.m4a?v=1 | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125159/iPhone/sticker_animation@2x.png?v=1 |
| `898125141` | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125141/android/sticker_sound.m4a?v=1 | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125141/iPhone/sticker_animation@2x.png?v=1 |
| `898125144` | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125144/android/sticker_sound.m4a?v=1 | https://stickershop.line-scdn.net/stickershop/v1/sticker/898125144/iPhone/sticker_animation@2x.png?v=1 |

The Chiikawa preview shows a small smile and pink cross-body bag, with no spoken-word caption. The Hachiware image displays すごいすごいっ！, expressing amazement or praise. The Usagi image displays ヤハ, transliterated as “yaha”. These are observations of the images, not verified audio transcripts.

All three audio files were parsed with ffprobe and fully decoded by ffmpeg without error. The paired APNG files were parsed and visually matched to their official preview entries. Direct listening was not possible because the reviewing model did not support audio input. Character association therefore comes from the matching official sticker images and preview metadata; no auditory speaker verification or exact transcript is asserted. The full per-file record is also included in `dist/assets/voices/README.txt`.

## Verification

The hero and all character images were visually inspected. The three individual character PNGs are text-free and transparent. Font files have valid WOFF2 signatures. No runtime network fetch is needed for these assets.
