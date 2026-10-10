export type Language = 'zh' | 'en'
export type LocalizedText = Record<Language, string>
export type CategoryId = 'album' | 'outfit' | 'home' | 'resonance' | 'tools'
export interface ShowcaseView {
  id: string
  label: LocalizedText
  caption: LocalizedText
  title: LocalizedText
  body: LocalizedText
  points: Record<Language, string[]>
  note: LocalizedText
  image: string | null
  alt: LocalizedText
  icon: string
  schematicTitle: LocalizedText
  schematicItems: Record<Language, string[]>
}
export interface ShowcaseCategory {
  id: CategoryId
  label: LocalizedText
  eyebrow: string
  icon: string
  defaultViewId: string
  views: ShowcaseView[]
}
// Add views here; the component derives the category totals and preview controls.
export const showcaseCategories: ShowcaseCategory[] = [
  {
    "id": "album",
    "label": {
      "zh": "相册管理",
      "en": "Album"
    },
    "eyebrow": "ALBUM",
    "icon": "images",
    "defaultViewId": "album-timeline",
    "views": [
      {
        "id": "album-timeline",
        "label": {
          "zh": "时间轴",
          "en": "Timeline"
        },
        "caption": {
          "zh": "相册时间轴",
          "en": "Album timeline"
        },
        "title": {
          "zh": "按时间，找回那一刻",
          "en": "Find that moment by date"
        },
        "body": {
          "zh": "按年、月、日浏览游戏照片，用搜索和日期跳转找到想看的瞬间。",
          "en": "Browse game photos by year, month and day. Search or jump to a date to find a favorite moment."
        },
        "points": {
          "zh": [
            "折叠日期分组，快速跳转",
            "搜索文件名和照片备注",
            "多种缩略图比例，批量选择操作"
          ],
          "en": [
            "Collapse date groups and jump to a date",
            "Search photo filenames and notes",
            "Choose thumbnail ratios and select photos in batches"
          ]
        },
        "note": {
          "zh": "选择本地相册目录后即可使用。",
          "en": "Choose a local album folder to begin."
        },
        "image": "/images/screenshots/album-timeline.webp",
        "alt": {
          "zh": "相册时间轴界面截图",
          "en": "Album timeline interface screenshot"
        },
        "icon": "calendar-days",
        "schematicTitle": {
          "zh": "按时间，找回那一刻",
          "en": "Find that moment by date"
        },
        "schematicItems": {
          "zh": [
            "折叠日期分组，快速跳转",
            "搜索文件名和照片备注",
            "多种缩略图比例，批量选择操作"
          ],
          "en": [
            "Date groups",
            "Search",
            "Batch selection"
          ]
        }
      },
      {
        "id": "album-actions",
        "label": {
          "zh": "动作分类",
          "en": "Action groups"
        },
        "caption": {
          "zh": "相册动作轴",
          "en": "Album action groups"
        },
        "title": {
          "zh": "按动作，发现相册里的灵感",
          "en": "Find inspiration by photo pose"
        },
        "body": {
          "zh": "开启自动解析动作后，按拍摄动作整理照片，快速浏览同类动作。",
          "en": "Enable automatic action parsing to group photos by their in-game poses."
        },
        "points": {
          "zh": [
            "自动解析照片里的拍摄动作",
            "在日期与动作分类之间切换",
            "动作结果本地缓存，减少重复解析"
          ],
          "en": [
            "Automatically identify photo actions",
            "Switch between date and action groups",
            "Reuse locally cached action results"
          ]
        },
        "note": {
          "zh": "需要读取游戏原图；解析所需 UID 可在参数窗口补充。",
          "en": "Requires original game photos. You can supply a UID in the parameter dialog when needed."
        },
        "image": "/images/screenshots/album-actions.webp",
        "alt": {
          "zh": "相册动作轴界面截图",
          "en": "Album action groups interface screenshot"
        },
        "icon": "sparkles",
        "schematicTitle": {
          "zh": "按动作，发现相册里的灵感",
          "en": "Find inspiration by photo pose"
        },
        "schematicItems": {
          "zh": [
            "自动解析照片里的拍摄动作",
            "在日期与动作分类之间切换",
            "动作结果本地缓存，减少重复解析"
          ],
          "en": [
            "Photo actions",
            "Action groups",
            "Local cache"
          ]
        }
      },
      {
        "id": "image-parameters",
        "label": {
          "zh": "照片参数",
          "en": "Photo parameters"
        },
        "caption": {
          "zh": "照片参数解析",
          "en": "Photo parameter parser"
        },
        "title": {
          "zh": "把拍摄参数，也看明白",
          "en": "Understand the settings behind a photo"
        },
        "body": {
          "zh": "从游戏原图里读取相机设置、环境和动作信息，找回照片里的拍摄灵感。",
          "en": "Read camera settings, environment and action information from an original game photo."
        },
        "points": {
          "zh": [
            "拍摄时间、天气、焦距和光圈",
            "画面调节、动作、灯光与滤镜",
            "读取可导入游戏的相机参数"
          ],
          "en": [
            "Game time, weather, focal length and aperture",
            "Image adjustments, actions, lights and filters",
            "Read camera parameters that can be imported into the game"
          ]
        },
        "note": {
          "zh": "选择单张原图即可解析；文件不上传，也不会加入相册。",
          "en": "Choose a single original photo. It is not uploaded or added to the album."
        },
        "image": "/images/screenshots/image-parameters.webp",
        "alt": {
          "zh": "照片参数解析界面截图",
          "en": "Photo parameter parser interface screenshot"
        },
        "icon": "camera",
        "schematicTitle": {
          "zh": "把拍摄参数，也看明白",
          "en": "Understand the settings behind a photo"
        },
        "schematicItems": {
          "zh": [
            "拍摄时间、天气、焦距和光圈",
            "画面调节、动作、灯光与滤镜",
            "读取可导入游戏的相机参数"
          ],
          "en": [
            "Camera settings",
            "Actions",
            "Lights and filters"
          ]
        }
      },
      {
        "id": "photo-lightbox",
        "label": {
          "zh": "大图预览",
          "en": "Full-size view"
        },
        "caption": {
          "zh": "照片大图预览",
          "en": "Full-size photo preview"
        },
        "title": {
          "zh": "放大看看，每一处细节",
          "en": "Take a closer look at every detail"
        },
        "body": {
          "zh": "双击照片打开大图，缩放和拖动查看细节，或用键盘连续翻阅。",
          "en": "Double-click a photo to open its preview. Zoom, drag and use the keyboard to browse."
        },
        "points": {
          "zh": [
            "支持 50%–300% 缩放与滚轮缩放",
            "放大后拖动，左右方向键翻页",
            "预览中可解析照片参数或删除照片"
          ],
          "en": [
            "Zoom from 50% to 300%, including mouse-wheel control",
            "Drag a zoomed photo and browse with the arrow keys",
            "Parse parameters or delete a photo from its preview"
          ]
        },
        "note": {
          "zh": "照片与预览过程在本地浏览器中完成。",
          "en": "Photos are read and previewed in your local browser."
        },
        "image": "/images/screenshots/photo-lightbox.webp",
        "alt": {
          "zh": "照片大图预览界面截图",
          "en": "Full-size photo preview interface screenshot"
        },
        "icon": "maximize-2",
        "schematicTitle": {
          "zh": "放大看看，每一处细节",
          "en": "Take a closer look at every detail"
        },
        "schematicItems": {
          "zh": [
            "支持 50%–300% 缩放与滚轮缩放",
            "放大后拖动，左右方向键翻页",
            "预览中可解析照片参数或删除照片"
          ],
          "en": [
            "Zoom",
            "Drag",
            "Keyboard browsing"
          ]
        }
      },
      {
        "id": "album-favorites",
        "label": {
          "zh": "收藏与备注",
          "en": "Favorites and notes"
        },
        "caption": {
          "zh": "照片收藏与备注",
          "en": "Photo favorites and notes"
        },
        "title": {
          "zh": "喜欢的照片，随时找得到",
          "en": "Keep favorite moments within reach"
        },
        "body": {
          "zh": "把心动瞬间放进收藏夹，给照片添加简短备注，之后可以用搜索快速找回。",
          "en": "Save favorite photos and add short notes so you can find them again through search."
        },
        "points": {
          "zh": [
            "爱心收藏与独立收藏夹",
            "照片备注最多 15 个字符",
            "支持批量收藏，搜索文件名与备注"
          ],
          "en": [
            "Heart favorites and a dedicated favorites view",
            "Photo notes up to 15 characters",
            "Batch favorites and filename or note search"
          ]
        },
        "note": {
          "zh": "收藏记录跨相册保留。",
          "en": "Favorite records are retained across albums."
        },
        "image": null,
        "alt": {
          "zh": "照片收藏与备注功能示意",
          "en": "Photo favorites and notes feature illustration"
        },
        "icon": "heart",
        "schematicTitle": {
          "zh": "把心动瞬间放进收藏夹",
          "en": "Keep favorite moments within reach"
        },
        "schematicItems": {
          "zh": [
            "收藏夹",
            "照片备注",
            "搜索"
          ],
          "en": [
            "Favorites",
            "Photo notes",
            "Search"
          ]
        }
      },
      {
        "id": "album-transfer",
        "label": {
          "zh": "导入导出",
          "en": "Import and export"
        },
        "caption": {
          "zh": "相册图片导入与导出",
          "en": "Photo import and export"
        },
        "title": {
          "zh": "整理好的照片，带到需要的地方",
          "en": "Take your photos where you need them"
        },
        "body": {
          "zh": "批量导入本地图片，也可以导出整个相册或只导出选中的照片。",
          "en": "Import local images in batches, or export an entire album or selected photos."
        },
        "points": {
          "zh": [
            "文件选择器批量导入图片",
            "全量导出与选中照片导出",
            "导出完成后可选择移走成功导出的源照片"
          ],
          "en": [
            "Import multiple images with the file picker",
            "Export all photos or only selected photos",
            "Optionally move successfully exported source photos to Recently Deleted"
          ]
        },
        "note": {
          "zh": "导出完成后，移走源照片是可选操作；取消导出会保留源照片。",
          "en": "Moving source photos after export is optional. Canceling an export preserves the source photos."
        },
        "image": null,
        "alt": {
          "zh": "相册图片导入与导出功能示意",
          "en": "Photo import and export feature illustration"
        },
        "icon": "files",
        "schematicTitle": {
          "zh": "导入、整理、导出",
          "en": "Take your photos where you need them"
        },
        "schematicItems": {
          "zh": [
            "导入图片",
            "导出全部",
            "导出选中"
          ],
          "en": [
            "Import images",
            "Export all",
            "Export selected"
          ]
        }
      },
      {
        "id": "album-trash",
        "label": {
          "zh": "最近删除",
          "en": "Recently Deleted"
        },
        "caption": {
          "zh": "最近删除与照片恢复",
          "en": "Recently Deleted and photo recovery"
        },
        "title": {
          "zh": "给误删的照片，留一次找回机会",
          "en": "Give deleted photos a chance to return"
        },
        "body": {
          "zh": "普通相册删除会把照片移入最近删除，可单张或批量恢复。",
          "en": "Regular album deletion moves photos to Recently Deleted, where they can be restored individually or in batches."
        },
        "points": {
          "zh": [
            "按删除时间查看照片与占用大小",
            "单张或批量恢复，恢复时避免同名覆盖",
            "支持永久删除和清空全部"
          ],
          "en": [
            "Browse by deletion time and view total size",
            "Restore photos without overwriting same-name files",
            "Permanently delete selected photos or clear the collection"
          ]
        },
        "note": {
          "zh": "最近删除不会自动过期；永久删除与清空全部不可恢复。",
          "en": "Recently Deleted does not expire automatically. Permanent deletion and clearing cannot be undone."
        },
        "image": null,
        "alt": {
          "zh": "最近删除与照片恢复功能示意",
          "en": "Recently Deleted and photo recovery feature illustration"
        },
        "icon": "archive-restore",
        "schematicTitle": {
          "zh": "误删后，可以恢复",
          "en": "Give deleted photos a chance to return"
        },
        "schematicItems": {
          "zh": [
            "最近删除",
            "恢复照片",
            "永久删除"
          ],
          "en": [
            "Recently Deleted",
            "Restore photos",
            "Permanently delete"
          ]
        }
      }
    ]
  },
  {
    "id": "outfit",
    "label": {
      "zh": "搭配方案",
      "en": "Outfits"
    },
    "eyebrow": "OUTFIT",
    "icon": "shirt",
    "defaultViewId": "outfit-library",
    "views": [
      {
        "id": "outfit-library",
        "label": {
          "zh": "方案列表",
          "en": "Scheme library"
        },
        "caption": {
          "zh": "搭配方案管理",
          "en": "Outfit scheme library"
        },
        "title": {
          "zh": "把喜欢的搭配，也收好",
          "en": "Keep your favorite outfits together"
        },
        "body": {
          "zh": "把搭配图片、搭配码、标签和备注一起保存，让每个灵感都有自己的位置。",
          "en": "Save outfit images, outfit codes, tags and notes together in your local collection."
        },
        "points": {
          "zh": [
            "标签分类、搜索和待填写方案",
            "选择、拖拽或粘贴搭配图片",
            "ZIP 备份导入与导出"
          ],
          "en": [
            "Tags, search and schemes with missing codes",
            "Choose, drag or paste outfit images",
            "Import and export ZIP backups"
          ]
        },
        "note": {
          "zh": "方案保存在当前相册文件夹中。",
          "en": "Schemes are saved inside the current album folder."
        },
        "image": "/images/screenshots/outfit-library.webp",
        "alt": {
          "zh": "搭配方案管理界面截图",
          "en": "Outfit scheme library interface screenshot"
        },
        "icon": "shirt",
        "schematicTitle": {
          "zh": "把喜欢的搭配，也收好",
          "en": "Keep your favorite outfits together"
        },
        "schematicItems": {
          "zh": [
            "标签分类、搜索和待填写方案",
            "选择、拖拽或粘贴搭配图片",
            "ZIP 备份导入与导出"
          ],
          "en": [
            "Outfit images",
            "Outfit codes",
            "Tags"
          ]
        }
      },
      {
        "id": "outfit-editor",
        "label": {
          "zh": "方案编辑",
          "en": "Edit scheme"
        },
        "caption": {
          "zh": "搭配方案编辑",
          "en": "Outfit scheme editor"
        },
        "title": {
          "zh": "图片、搭配码和标签，一起整理",
          "en": "Organize images, codes and tags together"
        },
        "body": {
          "zh": "添加或编辑搭配方案，搭配码可以暂时留空，之后再补充完整。",
          "en": "Add or edit an outfit scheme. Leave its code blank and complete it later if needed."
        },
        "points": {
          "zh": [
            "本地保存图片与搭配码",
            "为方案设置标签和简短备注",
            "大图预览中可复制搭配码或继续编辑"
          ],
          "en": [
            "Save an image and outfit code locally",
            "Assign a tag and a short note",
            "Copy a code or edit the scheme from its image preview"
          ]
        },
        "note": {
          "zh": "方案删除后不可恢复，请在实际操作时核对内容。",
          "en": "Deleted outfit schemes cannot be recovered. Review them before deleting in the app."
        },
        "image": "/images/screenshots/outfit-editor.webp",
        "alt": {
          "zh": "搭配方案编辑界面截图",
          "en": "Outfit scheme editor interface screenshot"
        },
        "icon": "file-image",
        "schematicTitle": {
          "zh": "图片、搭配码和标签，一起整理",
          "en": "Organize images, codes and tags together"
        },
        "schematicItems": {
          "zh": [
            "本地保存图片与搭配码",
            "为方案设置标签和简短备注",
            "大图预览中可复制搭配码或继续编辑"
          ],
          "en": [
            "Images",
            "Outfit codes",
            "Scheme tags"
          ]
        }
      },
      {
        "id": "outfit-auto-receive",
        "label": {
          "zh": "自动接收",
          "en": "Auto receive"
        },
        "caption": {
          "zh": "自动更新搭配码",
          "en": "Automatically receive outfit codes"
        },
        "title": {
          "zh": "游戏里生成，回来就能接收",
          "en": "Create it in game and collect it here"
        },
        "body": {
          "zh": "授权游戏目录后，在游戏中框选搭配截图、生成搭配码，再返回网页。",
          "en": "Authorize the game folder, frame an outfit screenshot in game, generate its code and return to the website."
        },
        "points": {
          "zh": [
            "授权当前游戏的 X6Game 文件夹",
            "游戏内框选搭配图片并生成搭配码",
            "检测到新码与更新后的图片才会导入"
          ],
          "en": [
            "Authorize the current game X6Game folder",
            "Frame an outfit image and generate its code in game",
            "Import only when both a new code and an updated outfit image are detected"
          ]
        },
        "note": {
          "zh": "相同搭配码、图片未更新或找不到图片时会跳过并提示。",
          "en": "Duplicate codes, unchanged images and missing images are skipped with a notice."
        },
        "image": null,
        "alt": {
          "zh": "自动更新搭配码功能示意",
          "en": "Automatically receive outfit codes feature illustration"
        },
        "icon": "refresh-cw",
        "schematicTitle": {
          "zh": "游戏里的搭配，收进方案库",
          "en": "Create it in game and collect it here"
        },
        "schematicItems": {
          "zh": [
            "框选图片",
            "生成搭配码",
            "返回网页"
          ],
          "en": [
            "Frame image",
            "Generate code",
            "Return to website"
          ]
        }
      },
      {
        "id": "outfit-code",
        "label": {
          "zh": "搭配码解析",
          "en": "Parse outfit code"
        },
        "caption": {
          "zh": "搭配码解析界面",
          "en": "Outfit code parser"
        },
        "title": {
          "zh": "从搭配码，找到每个部件",
          "en": "Identify every part from an outfit code"
        },
        "body": {
          "zh": "直接输入搭配码，查看服饰和妆容部件，不必先建立搭配方案。",
          "en": "Enter an outfit code directly to inspect clothing and makeup without creating a scheme first."
        },
        "points": {
          "zh": [
            "解析部件名称、类型与妆容",
            "从方案卡片或工具菜单打开",
            "已成功解析的搭配码会在本地缓存"
          ],
          "en": [
            "View part names, types and makeup",
            "Open from a scheme card or the tools menu",
            "Reuse successfully parsed codes from local cache"
          ]
        },
        "note": {
          "zh": "解析入口也可通过手机访问。",
          "en": "The parser entry is also accessible on a phone."
        },
        "image": "/images/screenshots/outfit-code.webp",
        "alt": {
          "zh": "搭配码解析界面界面截图",
          "en": "Outfit code parser interface screenshot"
        },
        "icon": "scan-search",
        "schematicTitle": {
          "zh": "从搭配码，找到每个部件",
          "en": "Identify every part from an outfit code"
        },
        "schematicItems": {
          "zh": [
            "解析部件名称、类型与妆容",
            "从方案卡片或工具菜单打开",
            "已成功解析的搭配码会在本地缓存"
          ],
          "en": [
            "Clothing parts",
            "Makeup",
            "Local cache"
          ]
        }
      },
      {
        "id": "outfit-parts",
        "label": {
          "zh": "部件详情",
          "en": "Part details"
        },
        "caption": {
          "zh": "搭配码部件与染色详情",
          "en": "Outfit part and dye details"
        },
        "title": {
          "zh": "套装、进化与染色，继续看清楚",
          "en": "Look closer at outfits, evolution and dyes"
        },
        "body": {
          "zh": "点击解析结果里的部件图片，查看所属套装、进化状态与染色信息。",
          "en": "Select a parsed part image to inspect its outfit relationship, evolution and dye information."
        },
        "points": {
          "zh": [
            "所属套装与套装图片",
            "进化或焕新状态、可染条件",
            "实际染色的区域、染色盘与色号"
          ],
          "en": [
            "Related outfit and outfit image",
            "Evolution or renewal state and dye requirements",
            "Applied dye regions, palettes and color codes"
          ]
        },
        "note": {
          "zh": "没有实际染色时，详情会隐藏染色区域。",
          "en": "Dye details are hidden when no actual dye is applied."
        },
        "image": "/images/screenshots/outfit-parts.webp",
        "alt": {
          "zh": "搭配码部件与染色详情界面截图",
          "en": "Outfit part and dye details interface screenshot"
        },
        "icon": "palette",
        "schematicTitle": {
          "zh": "套装、进化与染色，继续看清楚",
          "en": "Look closer at outfits, evolution and dyes"
        },
        "schematicItems": {
          "zh": [
            "所属套装与套装图片",
            "进化或焕新状态、可染条件",
            "实际染色的区域、染色盘与色号"
          ],
          "en": [
            "Related outfit",
            "Evolution",
            "Dye details"
          ]
        }
      }
    ]
  },
  {
    "id": "home",
    "label": {
      "zh": "家园方案",
      "en": "Home schemes"
    },
    "eyebrow": "HOME SCHEMES",
    "icon": "house",
    "defaultViewId": "home-plan",
    "views": [
      {
        "id": "home-plan",
        "label": {
          "zh": "方案列表",
          "en": "Scheme library"
        },
        "caption": {
          "zh": "家园码与组合码方案",
          "en": "Home and combination schemes"
        },
        "title": {
          "zh": "把心仪的家园灵感，也留下",
          "en": "Keep ideas for your dream home"
        },
        "body": {
          "zh": "集中管理家园码和组合码，为方案添加封面、标签和备注。",
          "en": "Organize home codes and combination codes with optional covers, tags and notes."
        },
        "points": {
          "zh": [
            "家园码、组合码分类查看",
            "搜索与标签筛选",
            "保存封面，编辑或删除方案"
          ],
          "en": [
            "Browse home codes and combination codes",
            "Search and filter by tags",
            "Save covers, edit schemes or delete them"
          ]
        },
        "note": {
          "zh": "方案、标签及可选封面保存在当前相册文件夹中。",
          "en": "Schemes, tags and optional covers are stored inside the current album folder."
        },
        "image": "/images/screenshots/home-plan.webp",
        "alt": {
          "zh": "家园码与组合码方案界面截图",
          "en": "Home and combination schemes interface screenshot"
        },
        "icon": "house",
        "schematicTitle": {
          "zh": "把心仪的家园灵感，也留下",
          "en": "Keep ideas for your dream home"
        },
        "schematicItems": {
          "zh": [
            "家园码、组合码分类查看",
            "搜索与标签筛选",
            "保存封面，编辑或删除方案"
          ],
          "en": [
            "Home codes",
            "Combination codes",
            "Tags"
          ]
        }
      },
      {
        "id": "home-plan-detail",
        "label": {
          "zh": "编辑与解析",
          "en": "Edit and parse"
        },
        "caption": {
          "zh": "家园方案编辑与解析",
          "en": "Home scheme editor and parser"
        },
        "title": {
          "zh": "输入方案码，信息自动整理",
          "en": "Enter a code and organize its details"
        },
        "body": {
          "zh": "输入家园码或组合码，自动解析已支持的方案信息，再补充标签和备注。",
          "en": "Enter a home or combination code to parse supported scheme information, then add a tag and note."
        },
        "points": {
          "zh": [
            "方案名称、类型和版本",
            "解析家具数量",
            "编辑标签、封面和简短备注"
          ],
          "en": [
            "Scheme name, type and version",
            "Parsed furniture count",
            "Edit tags, cover images and short notes"
          ]
        },
        "note": {
          "zh": "目前只开放已验证的服务器编号 49。",
          "en": "Currently limited to the verified server number 49."
        },
        "image": "/images/screenshots/home-plan-detail.webp",
        "alt": {
          "zh": "家园方案编辑与解析界面截图",
          "en": "Home scheme editor and parser interface screenshot"
        },
        "icon": "house",
        "schematicTitle": {
          "zh": "输入方案码，信息自动整理",
          "en": "Enter a code and organize its details"
        },
        "schematicItems": {
          "zh": [
            "方案名称、类型和版本",
            "解析家具数量",
            "编辑标签、封面和简短备注"
          ],
          "en": [
            "Scheme type",
            "Version",
            "Furniture count"
          ]
        }
      },
      {
        "id": "home-backup",
        "label": {
          "zh": "备份导入导出",
          "en": "ZIP backups"
        },
        "caption": {
          "zh": "家园方案 ZIP 备份",
          "en": "Home scheme ZIP backup"
        },
        "title": {
          "zh": "整理好的方案，记得留份备份",
          "en": "Keep a backup of your saved schemes"
        },
        "body": {
          "zh": "用 ZIP 导入或导出家园方案，在需要时重新导入已保存的数据。",
          "en": "Import or export home schemes as ZIP backups and restore them when needed."
        },
        "points": {
          "zh": [
            "ZIP 备份导入与导出",
            "备份保留方案与相关本地文件",
            "重复方案会跳过并给出结果提示"
          ],
          "en": [
            "Import and export ZIP backups",
            "Keep schemes and associated local files together",
            "Skip duplicate schemes and report the result"
          ]
        },
        "note": {
          "zh": "导出的 ZIP 保存在当前选择的相册文件夹中。",
          "en": "Exported ZIP files are saved in the selected album folder."
        },
        "image": null,
        "alt": {
          "zh": "家园方案 ZIP 备份功能示意",
          "en": "Home scheme ZIP backup feature illustration"
        },
        "icon": "package",
        "schematicTitle": {
          "zh": "方案与封面，一起备份",
          "en": "Keep a backup of your saved schemes"
        },
        "schematicItems": {
          "zh": [
            "家园方案",
            "ZIP 备份",
            "重新导入"
          ],
          "en": [
            "Home schemes",
            "ZIP backup",
            "Import again"
          ]
        }
      }
    ]
  },
  {
    "id": "resonance",
    "label": {
      "zh": "共鸣记录",
      "en": "Resonance"
    },
    "eyebrow": "RESONANCE",
    "icon": "sparkles",
    "defaultViewId": "resonance-records",
    "views": [
      {
        "id": "resonance-records",
        "label": {
          "zh": "套装记录",
          "en": "Outfit records"
        },
        "caption": {
          "zh": "共鸣记录与套装抽数",
          "en": "Resonance records and pull counts"
        },
        "title": {
          "zh": "每一次共鸣，都有迹可循",
          "en": "Keep track of every resonance"
        },
        "body": {
          "zh": "查看各卡池套装的部件获取顺序、总抽数与平均抽数，并切换第一套和第二套。",
          "en": "Review each banner outfit, part acquisition order, total and average pulls, and switch between the first and second sets."
        },
        "points": {
          "zh": [
            "按卡池排序，按四星或五星筛选",
            "查看部件获得顺序与对应抽数",
            "第一套、第二套部件分别查看"
          ],
          "en": [
            "Sort banners and filter four-star or five-star outfits",
            "Review part acquisition order and pull counts",
            "View the first and second outfit sets separately"
          ]
        },
        "note": {
          "zh": "无需先选择相册目录；记录保存在当前浏览器。",
          "en": "No album folder is required. Records are stored in the current browser."
        },
        "image": "/images/screenshots/resonance.webp",
        "alt": {
          "zh": "共鸣记录套装列表界面截图",
          "en": "Resonance records outfit list interface screenshot"
        },
        "icon": "sparkles",
        "schematicTitle": {
          "zh": "记录每个部件的获得过程",
          "en": "Keep track of every resonance"
        },
        "schematicItems": {
          "zh": [
            "总抽数",
            "平均抽数",
            "第一套 / 第二套"
          ],
          "en": [
            "Total pulls",
            "Average pulls",
            "First / second set"
          ]
        }
      },
      {
        "id": "resonance-pearpal",
        "label": {
          "zh": "美鸭梨导入",
          "en": "Pear-Pal import"
        },
        "caption": {
          "zh": "从美鸭梨奇想手账导入",
          "en": "Import from Pear-Pal Whim-Log"
        },
        "title": {
          "zh": "从奇想手账，带回共鸣记录",
          "en": "Bring your records back from Whim-Log"
        },
        "body": {
          "zh": "在国服美鸭梨登录并同步手账，按项目内的操作引导获取凭据，再预览导入。",
          "en": "Sign in to the CN Pear-Pal website, sync your Whim-Log and follow the app instructions to preview an import."
        },
        "points": {
          "zh": [
            "书签或控制台方式获取凭据",
            "核对游戏 UID，先预览再确认",
            "来源缺失或解析失败的卡池保留原记录"
          ],
          "en": [
            "Obtain credentials through the bookmark or console method",
            "Check the game UID, preview and then confirm",
            "Keep existing records for missing or unparsed source banners"
          ]
        },
        "note": {
          "zh": "凭据仅用于当前验证和获取记录，不保存到本地。",
          "en": "Credentials are used only for the current verification and retrieval and are not saved locally."
        },
        "image": null,
        "alt": {
          "zh": "从美鸭梨奇想手账导入功能示意",
          "en": "Import from Pear-Pal Whim-Log feature illustration"
        },
        "icon": "download",
        "schematicTitle": {
          "zh": "先预览，再写入本地记录",
          "en": "Bring your records back from Whim-Log"
        },
        "schematicItems": {
          "zh": [
            "美鸭梨手账",
            "导入预览",
            "确认保存"
          ],
          "en": [
            "Pear-Pal Whim-Log",
            "Import preview",
            "Confirm and save"
          ]
        }
      },
      {
        "id": "resonance-backup",
        "label": {
          "zh": "JSON 备份",
          "en": "JSON backups"
        },
        "caption": {
          "zh": "共鸣记录 JSON 导入导出",
          "en": "Resonance JSON import and export"
        },
        "title": {
          "zh": "已有记录，继续接着整理",
          "en": "Continue organizing the records you already have"
        },
        "body": {
          "zh": "导入本项目备份或暖暖共鸣录 JSON，也可以把当前记录导出为项目备份。",
          "en": "Import this app backup or supported Resonance Recorder JSON files, and export a versioned project backup."
        },
        "points": {
          "zh": [
            "兼容暖暖共鸣录新旧版 JSON",
            "导入前预览，同套装以文件记录覆盖",
            "项目备份保留手动补录标记"
          ],
          "en": [
            "Support old and new Resonance Recorder JSON formats",
            "Preview before import; matching outfit records are replaced by the file",
            "Preserve manual acquisition markers in project backups"
          ]
        },
        "note": {
          "zh": "文件只在浏览器中读取；云端同步目前待上线。",
          "en": "Files are read only in the browser. Cloud sync is not yet available."
        },
        "image": null,
        "alt": {
          "zh": "共鸣记录 JSON 导入导出功能示意",
          "en": "Resonance JSON import and export feature illustration"
        },
        "icon": "file-json",
        "schematicTitle": {
          "zh": "共鸣记录，本地导入与备份",
          "en": "Continue organizing the records you already have"
        },
        "schematicItems": {
          "zh": [
            "JSON 文件",
            "预览确认",
            "导出备份"
          ],
          "en": [
            "JSON file",
            "Preview and confirm",
            "Export backup"
          ]
        }
      }
    ]
  },
  {
    "id": "tools",
    "label": {
      "zh": "解析与工具",
      "en": "Parsers and tools"
    },
    "eyebrow": "PARSERS & TOOLS",
    "icon": "scan-search",
    "defaultViewId": "parse-tools",
    "views": [
      {
        "id": "parse-tools",
        "label": {
          "zh": "参数输入",
          "en": "Parameter input"
        },
        "caption": {
          "zh": "相机参数与图片解析入口",
          "en": "Photo and camera parameter input"
        },
        "title": {
          "zh": "原图或参数码，都有解析入口",
          "en": "Parse a photo or a parameter code"
        },
        "body": {
          "zh": "工具菜单集中提供本地原图上传、相机参数输入和搭配码输入。",
          "en": "The tools menu combines local image upload, camera parameter input and outfit code input."
        },
        "points": {
          "zh": [
            "电脑或手机上传单张本地游戏原图",
            "直接输入相机参数进行解析",
            "搭配码解析复用同一结果窗口"
          ],
          "en": [
            "Upload a single local original on a computer or phone",
            "Enter camera parameters directly",
            "Reuse the same outfit-code results dialog"
          ]
        },
        "note": {
          "zh": "不必先建立搭配方案；照片参数解析可手动补充 UID。",
          "en": "No outfit scheme is required. A UID can be supplied for photo parameter parsing."
        },
        // 放入 public/images/screenshots/parse-tools.webp 后刷新页面即可显示。
        "image": "/images/screenshots/parse-tools.webp",
        "alt": {
          "zh": "相机参数与图片解析入口界面截图",
          "en": "Photo and camera parameter input interface screenshot"
        },
        "icon": "scan-search",
        "schematicTitle": {
          "zh": "一个窗口，集中完成解析",
          "en": "Parse a photo or a parameter code"
        },
        "schematicItems": {
          "zh": [
            "上传原图",
            "相机参数",
            "搭配码"
          ],
          "en": [
            "Upload original",
            "Camera parameters",
            "Outfit code"
          ]
        }
      },
      {
        "id": "special-cleanup",
        "label": {
          "zh": "专项清理",
          "en": "Targeted cleanup"
        },
        "caption": {
          "zh": "游戏文件专项清理",
          "en": "Targeted game file cleanup"
        },
        "title": {
          "zh": "清理不需要的游戏文件",
          "en": "Clear game files you no longer need"
        },
        "body": {
          "zh": "授权游戏目录后，按类别清理低画质图片、截图、日志与缓存。",
          "en": "After authorizing the game folder, choose categories of low-quality images, screenshots, logs or caches to clean."
        },
        "points": {
          "zh": [
            "低画质照片与游戏截图",
            "崩溃快照和运行日志",
            "游戏内置浏览器与登录器缓存"
          ],
          "en": [
            "Low-quality photos and game screenshots",
            "Crash snapshots and runtime logs",
            "In-game browser and launcher caches"
          ]
        },
        "note": {
          "zh": "会修改电脑中的真实文件；专项清理删除后无法恢复。",
          "en": "This changes real files on your computer. Targeted cleanup cannot be undone."
        },
        "image": "/images/screenshots/special-cleanup.webp",
        "alt": {
          "zh": "游戏文件专项清理界面截图",
          "en": "Targeted game file cleanup interface screenshot"
        },
        "icon": "eraser",
        "schematicTitle": {
          "zh": "清理不需要的游戏文件",
          "en": "Clear game files you no longer need"
        },
        "schematicItems": {
          "zh": [
            "低画质照片与游戏截图",
            "崩溃快照和运行日志",
            "游戏内置浏览器与登录器缓存"
          ],
          "en": [
            "Low-quality images",
            "Logs",
            "Browser caches"
          ]
        }
      },
      {
        "id": "lucky-times",
        "label": {
          "zh": "抽卡吉时",
          "en": "Lucky times"
        },
        "caption": {
          "zh": "抽卡吉时参考",
          "en": "Lucky pull time reference"
        },
        "title": {
          "zh": "一点旅途中的娱乐参考",
          "en": "A little ritual for your journey"
        },
        "body": {
          "zh": "查看当前版本的抽卡玄学时间表，为共鸣时刻添一点仪式感。",
          "en": "Browse the current-version lucky pull time table as an entertainment reference."
        },
        "points": {
          "zh": [
            "日期、时段与面朝方位参考",
            "通过工具菜单直接打开",
            "适合与共鸣记录分开查看"
          ],
          "en": [
            "Reference dates, times and facing directions",
            "Open directly from the tools menu",
            "Keep this separate from actual resonance records"
          ]
        },
        "note": {
          "zh": "娱乐参考；实际出率仍以游戏概率为准。",
          "en": "For entertainment only. Actual pull rates follow the game probabilities."
        },
        "image": "/images/screenshots/lucky-times.webp",
        "alt": {
          "zh": "抽卡吉时参考界面截图",
          "en": "Lucky pull time reference interface screenshot"
        },
        "icon": "sparkles",
        "schematicTitle": {
          "zh": "一点旅途中的娱乐参考",
          "en": "A little ritual for your journey"
        },
        "schematicItems": {
          "zh": [
            "日期、时段与面朝方位参考",
            "通过工具菜单直接打开",
            "适合与共鸣记录分开查看"
          ],
          "en": [
            "Dates",
            "Time windows",
            "Facing direction"
          ]
        }
      }
    ]
  }
]
export const showcaseUi = {
  "title": {
    "zh": "从相册时光，到趁手的小工具。",
    "en": "From album memories to handy tools."
  },
  "intro": {
    "zh": "整理照片、珍藏搭配与家园灵感，也把每一次共鸣好好记录。",
    "en": "Organize photos, save outfit and home ideas, and keep track of each resonance."
  },
  "categoriesLabel": {
    "zh": "功能分类",
    "en": "Feature categories"
  },
  "viewsLabel": {
    "zh": "组内界面",
    "en": "Views in this category"
  },
  "openImage": {
    "zh": "放大查看",
    "en": "View full size"
  },
  "closeImage": {
    "zh": "关闭预览",
    "en": "Close preview"
  },
  "dialogLabel": {
    "zh": "放大查看界面截图",
    "en": "Full-size interface preview"
  },
  "openApp": {
    "zh": "打开暖立方工具集",
    "en": "Open NikkiCube toolkit"
  },
  "localReading": {
    "zh": "照片在本地读取",
    "en": "Photos are read locally"
  }
}
export const showcaseSupport = {
  "title": {
    "zh": "帮助与设置",
    "en": "Help and settings"
  },
  "items": [
    {
      "title": {
        "zh": "使用帮助与更新记录",
        "en": "Help and update history"
      },
      "body": {
        "zh": "网站介绍、操作教程、注意事项，以及当前版本和历史更新。",
        "en": "App introduction, usage guides, important notes and current or historical updates."
      }
    },
    {
      "title": {
        "zh": "相册授权与视图设置",
        "en": "Album access and view settings"
      },
      "body": {
        "zh": "切换或恢复相册路径，授权 X6Game；调整主题、语言与照片缩略图比例。",
        "en": "Switch or restore album access, authorize X6Game, and adjust theme, language and thumbnail ratios."
      }
    },
    {
      "title": {
        "zh": "缓存与本地数据",
        "en": "Cache and local data"
      },
      "body": {
        "zh": "清除解析缓存，或清除浏览器中的网站数据及授权。不会删除电脑里的照片。",
        "en": "Clear parser caches or local app data and authorizations. This does not delete photos on your computer."
      }
    },
    {
      "title": {
        "zh": "反馈与支持",
        "en": "Feedback and support"
      },
      "body": {
        "zh": "问题反馈、作者社交平台与支持作者入口，集中放在工具集的“更多”菜单。",
        "en": "Find issue feedback, creator profiles and support links in the toolkit More menu."
      }
    }
  ],
  "cloudStatus": {
    "zh": "共鸣记录云端同步 · 待上线",
    "en": "Resonance cloud sync · Coming soon"
  }
}
