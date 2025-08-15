<template>
  <div class="video-list-container">
    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by artist or song..."
        class="search-input"
      />
      <div class="nb-songs">
        {{ filteredVideos.length }} song{{ filteredVideos.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Table Header -->
    <div class="table-header" v-once>
      <div class="col-artist">Artist</div>
      <div class="col-song">Song</div>
      <div class="col-link">Link</div>
    </div>

    <!-- Scrollable Table Body -->
    <div class="table-body">
      <div
        class="table-row"
        v-for="video in filteredVideos"
        :key="video.id"
        v-memo="[video.id, searchQuery]"
      >
        <div class="col-artist">{{ video.artist }}</div>
        <div class="col-song">{{ video.song }}</div>
        <div class="col-link">
          <a
            :href="`https://youtube.com/watch?v=${video.id}`"
            target="_blank"
            :title="video.tooltip"
            class="video-link"
          >
            Watch
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoList',
  props: {
    videos: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    // Process videos once and cache the result
    processedVideos() {
      return this.videos.map(video => {
        const parts = video.songHash.split(' - ');
        const artist = parts.length > 1 ? parts[0] : 'Unknown Artist';
        const song = parts.slice(1).join(' - ') || video.songHash;
        
        return {
          ...video,
          artist,
          song,
          searchText: `${artist} - ${song}`.toLowerCase(),
          tooltip: `Original Title: ${video.title}
Channel: ${video.channelName}
Published: ${this.formatDate(video.publishedAt)}`
        };
      });
    },
    
    // Filter videos based on search query
    filteredVideos() {
      if (!this.searchQuery.trim()) {
        return this.processedVideos;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.processedVideos.filter(video => 
        video.searchText.includes(query)
      );
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
}
</script>

<style scoped>
.video-list-container {
  border: 1px solid #444;
  overflow: hidden;
  background: #1a1a1a;
  color: #e0e0e0;
}

.search-bar {
  padding: 12px;
  border-bottom: 1px solid #444;
  background: #2d2d2d;
  display: flex;
}

.nb-songs {
    white-space: nowrap;
    min-width: 90px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background: #1a1a1a;
  color: #e0e0e0;
}

.search-input:focus {
  outline: none;
  border-color: #0d7377;
  box-shadow: 0 0 0 2px rgba(13, 115, 119, 0.25);
}

.search-input::placeholder {
  color: #888;
}

.table-header {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
  font-weight: bold;
  padding: 0 12px;
  height: 40px;
  align-items: center;
  scrollbar-gutter: stable;
  overflow: auto;
}

.table-body {
  max-height: 300px;
  min-height: 300px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  min-height: 0;
  align-items: center;
  padding: 0px 12px;
  border-bottom: 1px solid #333;
}

.table-row:hover {
  background: #2d2d2d;
}

.table-row:nth-child(even) {
  background: #252525;
}

.table-row:nth-child(even):hover {
  background: #2d2d2d;
}

.col-artist {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.col-song {
  flex: 1.5;
  min-width: 0;
  margin-right: 12px;
}

.col-artist, .col-song {
    padding: 8px 0;
}

.col-link {
  flex: 0 0 80px;
}

.video-link {
  display: inline-block;
  padding: 4px 12px;
  background: #0d7377;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.video-link:hover {
  background: #14a085;
  color: white;
}

</style>
