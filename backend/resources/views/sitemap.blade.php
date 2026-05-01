<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ $baseUrl }}</loc>
        <priority>1.0</priority>
        <changefreq>daily</changefreq>
    </url>
    <url>
        <loc>{{ $baseUrl }}/berita</loc>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>{{ $baseUrl }}/agenda</loc>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>{{ $baseUrl }}/pengumuman</loc>
        <priority>0.8</priority>
    </url>

    @foreach ($pages as $page)
    <url>
        <loc>{{ $baseUrl }}/profil/{{ $page->slug }}</loc>
        <lastmod>{{ $page->updated_at->toAtomString() }}</lastmod>
        <priority>0.7</priority>
    </url>
    @endforeach

    @foreach ($posts as $post)
    <url>
        <loc>{{ $baseUrl }}/berita/{{ $post->slug }}</loc>
        <lastmod>{{ $post->updated_at->toAtomString() }}</lastmod>
        <priority>0.6</priority>
    </url>
    @endforeach

    @foreach ($agendas as $agenda)
    <url>
        <loc>{{ $baseUrl }}/agenda/{{ $agenda->slug }}</loc>
        <lastmod>{{ $agenda->updated_at->toAtomString() }}</lastmod>
        <priority>0.6</priority>
    </url>
    @endforeach

    @foreach ($announcements as $announcement)
    <url>
        <loc>{{ $baseUrl }}/pengumuman/{{ $announcement->slug }}</loc>
        <lastmod>{{ $announcement->updated_at->toAtomString() }}</lastmod>
        <priority>0.5</priority>
    </url>
    @endforeach
</urlset>
