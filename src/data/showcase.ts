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
  schematicTitle: LocalizedText
  schematicItems: Record<Language, string[]>
}
export interface ShowcaseCategory {
  id: CategoryId
  label: LocalizedText
  eyebrow: string
  defaultViewId: string
  views: ShowcaseView[]
}

export const showcaseCategories: ShowcaseCategory[] = [
  {
    "id": "album",
    "label": {
      "zh": "相册管理",
      "en": "Album"
    },
    "eyebrow": "ALBUM",
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
          "zh": "选择本地相册目录后即可使用。普通授权失败时可尝试“兼容打开（只读）”；支持浏览、解析、收藏和 ZIP 导出，刷新后需重选文件夹，无法修改原文件。",
          "en": "Choose a local album folder to begin. If authorization fails, try Compatibility open (read-only) to browse, decode, favorite and export ZIPs. Reselect after reloading; original files cannot be changed."
        },
        "image": "/images/screenshots/album-timeline.webp",
        "alt": {
          "zh": "相册时间轴界面截图",
          "en": "Album timeline interface screenshot"
        },
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
          "zh": "从游戏原图读取相机设置、环境、动作和穿搭，点击部件查看染色详情；电脑端可切换上下或左右布局并记住选择。",
          "en": "Read camera settings, environment, actions and outfits from original game photos. Select pieces for dye details; desktop supports stacked or side-by-side layouts and remembers your choice."
        },
        "points": {
          "zh": [
            "拍摄时间、天气、焦距和光圈",
            "画面调节、动作、灯光与滤镜",
            "读取可导入游戏的相机参数",
            "点击“收藏参数”，保存至收藏夹的相机参数页"
          ],
          "en": [
            "Game time, weather, focal length and aperture",
            "Image adjustments, actions, lights and filters",
            "Read camera parameters that can be imported into the game",
            "Click Save parameters to add them to Camera Parameters in Favorites"
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
        "schematicTitle": {
          "zh": "把拍摄参数，也看明白",
          "en": "Understand the settings behind a photo"
        },
        "schematicItems": {
          "zh": [
            "拍摄时间、天气、焦距和光圈",
            "画面调节、动作、灯光与滤镜",
            "读取可导入游戏的相机参数",
            "点击“收藏参数”，保存至收藏夹的相机参数页"
          ],
          "en": [
            "Game time, weather, focal length and aperture",
            "Image adjustments, actions, lights and filters",
            "Read camera parameters that can be imported into the game",
            "Click Save parameters to add them to Camera Parameters in Favorites"
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
      "zh": "搭配码",
      "en": "Outfit codes"
    },
    "eyebrow": "OUTFIT",
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
          "zh": "数据保存在当前浏览器，所有相册共用，无需先选择相册目录。",
          "en": "Data is saved in the current browser and shared across albums. No album folder is required."
        },
        "image": "/images/screenshots/outfit-library.webp",
        "alt": {
          "zh": "搭配方案管理界面截图",
          "en": "Outfit scheme library interface screenshot"
        },
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
            "实际染色的区域、染色盘与色号",
            "点击“所属套装”旁的跳转图标，打开套装详情"
          ],
          "en": [
            "Related outfit and outfit image",
            "Evolution or renewal state and dye requirements",
            "Applied dye regions, palettes and color codes",
            "Click the link icon beside the outfit name to open outfit details"
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
        "schematicTitle": {
          "zh": "套装、进化与染色，继续看清楚",
          "en": "Look closer at outfits, evolution and dyes"
        },
        "schematicItems": {
          "zh": [
            "所属套装与套装图片",
            "进化或焕新状态、可染条件",
            "实际染色的区域、染色盘与色号",
            "点击“所属套装”旁的跳转图标，打开套装详情"
          ],
          "en": [
            "Related outfit and outfit image",
            "Evolution or renewal state and dye requirements",
            "Applied dye regions, palettes and color codes",
            "Click the link icon beside the outfit name to open outfit details"
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
          "zh": "电脑和手机均可管理家园码与组合码，为方案添加封面、标签和备注，无需授权相册目录。",
          "en": "Manage home and combination codes on desktop or mobile, with covers, tags and notes, without album folder access."
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
          "zh": "数据保存在当前浏览器，所有相册共用，无需先选择相册目录。",
          "en": "Data is saved in the current browser and shared across albums. No album folder is required."
        },
        "image": "/images/screenshots/home-plan.webp",
        "alt": {
          "zh": "家园码与组合码方案界面截图",
          "en": "Home and combination schemes interface screenshot"
        },
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
          "zh": "导出文件由浏览器下载设置决定保存位置。",
          "en": "The browser download settings determine where exported files are saved."
        },
        "image": null,
        "alt": {
          "zh": "家园方案 ZIP 备份功能示意",
          "en": "Home scheme ZIP backup feature illustration"
        },
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
      "zh": "暖暖档案",
      "en": "Nikki Archive"
    },
    "eyebrow": "NIKKI ARCHIVE",
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
          "zh": "查看卡池套装的部件获取记录、总抽数与平均抽数；电脑同时展示两套部件，手机可在卡片右上角切换套数。",
          "en": "Review piece acquisition records, total and average pulls. Desktop displays both sets together; mobile provides a set switch in the card’s top-right corner."
        },
        "points": {
          "zh": [
            "按卡池排序，按四星或五星筛选",
            "电脑同时展示两套，手机切换第一套／第二套",
            "点击套装图片或部件图片，打开对应详情"
          ],
          "en": [
            "Sort banners and filter four-star or five-star outfits",
            "View both sets on desktop; switch sets on mobile",
            "Click outfit or piece images to open their details"
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
        "schematicTitle": {
          "zh": "记录每个部件的获得过程",
          "en": "Keep track of every resonance"
        },
        "schematicItems": {
          "zh": [
            "按卡池排序，按四星或五星筛选",
            "电脑同时展示两套，手机切换第一套／第二套",
            "点击套装图片或部件图片，打开对应详情"
          ],
          "en": [
            "Sort banners and filter four-star or five-star outfits",
            "View both sets on desktop; switch sets on mobile",
            "Click outfit or piece images to open their details"
          ]
        }
      },
      {
        "id": "wardrobe-outfits",
        "label": {
          "zh": "衣橱-套装",
          "en": "Wardrobe - Outfits"
        },
        "caption": {
          "zh": "衣橱-套装",
          "en": "Wardrobe - Outfits"
        },
        "title": {
          "zh": "按套装，查看衣橱收集进度",
          "en": "Explore your collection by outfit"
        },
        "body": {
          "zh": "浏览已集齐、收集中与未拥有的套装，查看每套的部件收集进度。点击套装卡片即可打开套装详情。",
          "en": "Browse complete, partially collected and unowned outfits and review their piece collection progress. Click an outfit card to open its details."
        },
        "points": {
          "zh": [
            "按状态、星级、进化阶段、版本、风格、来源和标签筛选；可合并展示同系列形态",
            "搜索套装，查看已集齐数量与收集进度",
            "点击套装卡片打开套装详情"
          ],
          "en": [
            "Filter by ownership, rarity, evolution, version, style, source and tags; group forms from the same family",
            "Search outfits and review completed counts and collection progress",
            "Click an outfit card to open outfit details"
          ]
        },
        "note": {
          "zh": "部分来源的拥有信息可能未包含在导入数据中，未识别到的部件显示为“未知”。",
          "en": "Some sources may lack ownership data in the import; unrecognized pieces are shown as Unknown."
        },
        "image": "/images/screenshots/wardrobe.webp",
        "alt": {
          "zh": "衣橱-套装界面截图",
          "en": "Wardrobe - Outfits interface screenshot"
        },
        "schematicTitle": {
          "zh": "按套装，查看衣橱收集进度",
          "en": "Explore your collection by outfit"
        },
        "schematicItems": {
          "zh": [
            "按状态、星级、进化阶段、版本、风格、来源和标签筛选；可合并展示同系列形态",
            "搜索套装，查看已集齐数量与收集进度",
            "点击套装卡片打开套装详情"
          ],
          "en": [
            "Filter by ownership, rarity, evolution, version, style, source and tags; group forms from the same family",
            "Search outfits and review completed counts and collection progress",
            "Click an outfit card to open outfit details"
          ]
        }
      },
      {
        "id": "wardrobe-items",
        "label": {
          "zh": "衣橱-部件",
          "en": "Wardrobe - Pieces"
        },
        "caption": {
          "zh": "衣橱-部件",
          "en": "Wardrobe - Pieces"
        },
        "title": {
          "zh": "每个部件，都能单独查找",
          "en": "Find each clothing piece"
        },
        "body": {
          "zh": "切换到部件列表，按部位与其他条件查找服装，查看已拥有、未拥有和未知状态；点击部件卡片打开详情。",
          "en": "Switch to pieces to find clothing by category and other filters, review Owned, Not owned and Unknown states, and click a card for details."
        },
        "points": {
          "zh": [
            "按部位、状态、星级、风格、来源等条件筛选",
            "套装与部件分别保留筛选条件",
            "点击部件卡片打开部件详情"
          ],
          "en": [
            "Filter by category, ownership, rarity, style, source and more",
            "Outfits and pieces retain separate filters",
            "Click a piece card to open piece details"
          ]
        },
        "note": {
          "zh": "部分来源的拥有信息可能未包含在导入数据中，未识别到的部件显示为“未知”。",
          "en": "Some sources may lack ownership data in the import; unrecognized pieces are shown as Unknown."
        },
        "image": "/images/screenshots/wardrobe-items.webp",
        "alt": {
          "zh": "衣橱-部件界面截图",
          "en": "Wardrobe - Pieces interface screenshot"
        },
        "schematicTitle": {
          "zh": "每个部件，都能单独查找",
          "en": "Find each clothing piece"
        },
        "schematicItems": {
          "zh": [
            "按部位、状态、星级、风格、来源等条件筛选",
            "套装与部件分别保留筛选条件",
            "点击部件卡片打开部件详情"
          ],
          "en": [
            "Filter by category, ownership, rarity, style, source and more",
            "Outfits and pieces retain separate filters",
            "Click a piece card to open piece details"
          ]
        }
      },
      {
        "id": "wardrobe-outfit-details",
        "label": {
          "zh": "套装详情",
          "en": "Outfit details"
        },
        "caption": {
          "zh": "套装详情",
          "en": "Outfit details"
        },
        "title": {
          "zh": "从一套搭配，看到每个部件",
          "en": "Explore an outfit piece by piece"
        },
        "body": {
          "zh": "点击衣橱套装卡片或共鸣记录中的套装图片，查看套装收集进度、星级、风格、来源版本、介绍及部件列表。",
          "en": "Click an outfit card in the wardrobe or an outfit image in resonance records to view collection progress, rarity, style, release version, description and pieces."
        },
        "points": {
          "zh": [
            "查看套装信息与部件收集进度",
            "点击部件图片，打开部件详情",
            "通过关联入口查看进化形态"
          ],
          "en": [
            "Review outfit information and piece collection progress",
            "Click piece images to open piece details",
            "Use related links to explore evolution variants"
          ]
        },
        "note": {
          "zh": "搭配码部件详情中，点击“所属套装”旁的跳转图标即可打开套装详情。",
          "en": "In decoded piece details, click the link icon beside the outfit name to open outfit details."
        },
        "image": "/images/screenshots/wardrobe-outfit-details.webp",
        "alt": {
          "zh": "套装详情界面截图",
          "en": "Outfit details interface screenshot"
        },
        "schematicTitle": {
          "zh": "从一套搭配，看到每个部件",
          "en": "Explore an outfit piece by piece"
        },
        "schematicItems": {
          "zh": [
            "查看套装信息与部件收集进度",
            "点击部件图片，打开部件详情",
            "通过关联入口查看进化形态"
          ],
          "en": [
            "Review outfit information and piece collection progress",
            "Click piece images to open piece details",
            "Use related links to explore evolution variants"
          ]
        }
      },
      {
        "id": "wardrobe-item-details",
        "label": {
          "zh": "部件详情",
          "en": "Piece details"
        },
        "caption": {
          "zh": "部件详情",
          "en": "Piece details"
        },
        "title": {
          "zh": "点开部件，继续了解它",
          "en": "Take a closer look at a piece"
        },
        "body": {
          "zh": "点击衣橱部件卡片、套装详情中的部件图片或共鸣记录中的部件图片，打开对应部件详情。",
          "en": "Click a wardrobe piece card, a piece image in outfit details, or a piece image in resonance records to open its details."
        },
        "points": {
          "zh": [
            "查看部件图片与相关信息",
            "查看关联套装，并继续打开套装详情",
            "搭配码解析的部件详情提供“所属套装”跳转入口"
          ],
          "en": [
            "View the piece image and related information",
            "Explore associated outfits and open outfit details",
            "Decoded piece details include a link beside the outfit name"
          ]
        },
        "note": {
          "zh": "搭配码部件详情中，点击“所属套装”旁的跳转图标即可打开套装详情。",
          "en": "In decoded piece details, click the link icon beside the outfit name to open outfit details."
        },
        "image": "/images/screenshots/wardrobe-item-details.webp",
        "alt": {
          "zh": "部件详情界面截图",
          "en": "Piece details interface screenshot"
        },
        "schematicTitle": {
          "zh": "点开部件，继续了解它",
          "en": "Take a closer look at a piece"
        },
        "schematicItems": {
          "zh": [
            "查看部件图片与相关信息",
            "查看关联套装，并继续打开套装详情",
            "搭配码解析的部件详情提供“所属套装”跳转入口"
          ],
          "en": [
            "View the piece image and related information",
            "Explore associated outfits and open outfit details",
            "Decoded piece details include a link beside the outfit name"
          ]
        }
      },
      {
        "id": "resonance-pearpal",
        "label": {
          "zh": "手账导入",
          "en": "Whim-Log import"
        },
        "caption": {
          "zh": "从美鸭梨奇想手账导入",
          "en": "Import from Pear-Pal Whim-Log"
        },
        "title": {
          "zh": "从奇想手账，带回你的暖暖档案",
          "en": "Bring your Nikki Archive back from Whim-Log"
        },
        "body": {
          "zh": "选择国服或国际服对应区服，按应用内引导登录并获取手账凭据，预览后选择导入共鸣记录或衣橱数据。",
          "en": "Choose your China or global server and follow the in-app sign-in and credential instructions, then preview and select resonance records or wardrobe data to import."
        },
        "points": {
          "zh": [
            "建议使用电脑，通过书签或控制台获取凭据",
            "核对游戏 UID，先预览再选择数据类型",
            "确认导入共鸣记录后，以预览结果替换全部本地共鸣记录"
          ],
          "en": [
            "Use a computer to obtain credentials through a bookmark or the console",
            "Check the UID, preview, and choose the data types",
            "Confirming resonance import replaces all local resonance records with the preview"
          ]
        },
        "note": {
          "zh": "凭据仅用于当前验证和获取记录，不保存到本地。",
          "en": "Credentials are used only for the current verification and retrieval and are not saved locally."
        },
        "image": "/images/screenshots/archive-pearpal.webp",
        "alt": {
          "zh": "从美鸭梨奇想手账导入功能示意",
          "en": "Import from Pear-Pal Whim-Log feature illustration"
        },
        "schematicTitle": {
          "zh": "先预览，再写入本地记录",
          "en": "Bring your records back from Whim-Log"
        },
        "schematicItems": {
          "zh": [
            "建议使用电脑，通过书签或控制台获取凭据",
            "核对游戏 UID，先预览再选择数据类型",
            "确认导入共鸣记录后，以预览结果替换全部本地共鸣记录"
          ],
          "en": [
            "Use a computer to obtain credentials through a bookmark or the console",
            "Check the UID, preview, and choose the data types",
            "Confirming resonance import replaces all local resonance records with the preview"
          ]
        }
      },
      {
        "id": "resonance-backup",
        "label": {
          "zh": "数据备份",
          "en": "Data backup"
        },
        "caption": {
          "zh": "暖暖档案数据备份",
          "en": "Archive data backup"
        },
        "title": {
          "zh": "把共鸣与衣橱记录，安心保存",
          "en": "Keep your resonance and wardrobe records safe"
        },
        "body": {
          "zh": "共鸣记录与个人衣橱均支持本地导入导出，也可通过“更多”中的全部数据备份一并迁移。",
          "en": "Import or export resonance records and wardrobe data locally, or migrate both with the all-data backup in More."
        },
        "points": {
          "zh": [
            "共鸣记录与个人衣橱支持分别备份",
            "共鸣记录支持导入本工具及兼容的暖暖共鸣录 JSON",
            "全部数据备份包含衣橱，不包含相册原图与网站设置"
          ],
          "en": [
            "Back up resonance records and wardrobe separately",
            "Import resonance JSON from this app or supported Resonance Recorder exports",
            "All-data backups include wardrobe, but exclude original photos and site settings"
          ]
        },
        "note": {
          "zh": "本地文件在浏览器中读取；云端同步可另行手动操作。",
          "en": "Local files are read in the browser; cloud sync is available separately."
        },
        "image": "/images/screenshots/data-backup.webp",
        "alt": {
          "zh": "暖暖档案数据备份界面截图",
          "en": "Archive data backup interface screenshot"
        },
        "schematicTitle": {
          "zh": "共鸣与衣橱，本地导入和备份",
          "en": "Local imports and backups for your archive"
        },
        "schematicItems": {
          "zh": [
            "共鸣记录与个人衣橱支持分别备份",
            "共鸣记录支持导入兼容的 JSON",
            "全部数据备份可一并迁移档案"
          ],
          "en": [
            "Separate resonance and wardrobe backups",
            "Import compatible resonance JSON",
            "Migrate archive data with an all-data backup"
          ]
        }
      },
      {
        "id": "resonance-cloud",
        "label": {
          "zh": "数据同步",
          "en": "Data sync"
        },
        "caption": {
          "zh": "暖暖档案数据同步",
          "en": "Archive data sync"
        },
        "title": {
          "zh": "换一台设备，档案也能接着用",
          "en": "Keep your archive across devices"
        },
        "body": {
          "zh": "登录同一账号，可单独或一起上传、下载共鸣记录与个人衣橱，在电脑和手机之间手动同步档案数据。",
          "en": "Sign in with the same account to upload or download resonance and wardrobe separately or together across desktop and mobile."
        },
        "points": {
          "zh": [
            "共鸣记录与个人衣橱均支持云端存档",
            "按模块选择上传或下载，确认前核对数据",
            "支持删除云端存档，本地数据不受影响"
          ],
          "en": [
            "Cloud saves for both resonance records and wardrobe",
            "Choose modules to upload or download and review before confirming",
            "Delete cloud saves without affecting local data"
          ]
        },
        "note": {
          "zh": "同步需手动触发，登录及本地修改不会自动上传。",
          "en": "Sync is manual; signing in and local edits do not automatically upload data."
        },
        "image": "/images/screenshots/data-sync.webp",
        "alt": {
          "zh": "暖暖档案数据同步界面截图",
          "en": "Archive data sync interface screenshot"
        },
        "schematicTitle": {
          "zh": "换一台设备，档案也能接着用",
          "en": "Keep your archive across devices"
        },
        "schematicItems": {
          "zh": [
            "共鸣记录与个人衣橱均支持云端存档",
            "按模块选择上传或下载，确认前核对数据",
            "支持删除云端存档，本地数据不受影响"
          ],
          "en": [
            "Cloud saves for resonance and wardrobe",
            "Select modules to sync manually",
            "Delete cloud saves without affecting local data"
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
        "image": "/images/screenshots/parse-tools.webp",
        "alt": {
          "zh": "相机参数与图片解析入口界面截图",
          "en": "Photo and camera parameter input interface screenshot"
        },
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
        "id": "camera-favorites",
        "label": {
          "zh": "相机参数收藏",
          "en": "Camera parameter favorites"
        },
        "caption": {
          "zh": "相机参数收藏",
          "en": "Camera parameter favorites"
        },
        "title": {
          "zh": "把喜欢的拍摄参数，也珍藏",
          "en": "Keep your favorite camera presets"
        },
        "body": {
          "zh": "从照片参数解析窗口点击“收藏参数”，或在收藏夹的“相机参数”页手动添加。",
          "en": "Click Save parameters in the photo parameter dialog, or add a preset manually under Camera Parameters in Favorites."
        },
        "points": {
          "zh": [
            "自定义名称、封面与单标签分类",
            "复制参数、编辑收藏或打开详情",
            "支持 ZIP 备份导入与导出"
          ],
          "en": [
            "Custom names, covers and single-tag categories",
            "Copy parameters, edit favorites, or open details",
            "Import and export ZIP backups"
          ]
        },
        "note": {
          "zh": "数据保存在当前浏览器，所有相册共用，无需先选择相册目录。",
          "en": "Data is saved in the current browser and shared across albums. No album folder is required."
        },
        "image": "/images/screenshots/camera-favorites.webp",
        "alt": {
          "zh": "相机参数收藏界面截图",
          "en": "Camera parameter favorites interface screenshot"
        },
        "schematicTitle": {
          "zh": "把喜欢的拍摄参数，也珍藏",
          "en": "Keep your favorite camera presets"
        },
        "schematicItems": {
          "zh": [
            "自定义名称、封面与单标签分类",
            "复制参数、编辑收藏或打开详情",
            "支持 ZIP 备份导入与导出"
          ],
          "en": [
            "Custom names, covers and single-tag categories",
            "Copy parameters, edit favorites, or open details",
            "Import and export ZIP backups"
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
            "日期、时段、面朝方位与需避开生肖参考",
            "通过工具菜单直接打开",
            "适合与共鸣记录分开查看"
          ],
          "en": [
            "Reference dates, times, facing directions and zodiac signs to avoid",
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
        "schematicTitle": {
          "zh": "一点旅途中的娱乐参考",
          "en": "A little ritual for your journey"
        },
        "schematicItems": {
          "zh": [
            "日期、时段、面朝方位与需避开生肖参考",
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
    },
    {
      "title": {
        "zh": "全部数据备份与迁移",
        "en": "All-data backup and migration"
      },
      "body": {
        "zh": "在“更多”中导出或导入搭配码、家园方案、相机参数收藏、共鸣记录与衣橱数据，不包含相册原图与网站设置。",
        "en": "Use More to export or import outfit codes, home schemes, camera favorites, resonance records and wardrobe data; original album photos and site settings are excluded."
      }
    }
  ],
  "cloudStatus": {
    "zh": "暖暖档案数据同步 · 共鸣记录与个人衣橱支持手动上传和下载",
    "en": "Archive data sync · Manual upload and download for resonance and wardrobe"
  }
}
