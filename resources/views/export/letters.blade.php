@php($th = $locale === 'th')
<!doctype html>
<html lang="{{ $locale }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $th ? 'จดหมายของฉัน · เรา' : 'My letters · Rao' }}</title>
<style>
  body{margin:0;background:#f3e3e7;color:#2b2540;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
  main{max-width:640px;margin:0 auto;padding:32px 16px 64px}
  h1{font-size:28px;margin:0 0 4px} h2{font-size:20px;margin:40px 0 12px}
  .muted{color:#6b6280;font-size:14px}
  .sheet{background:#fffaf8;border-radius:12px;padding:16px 18px;margin:12px 0;box-shadow:0 1px 2px rgba(0,0,0,.06),0 6px 16px -10px rgba(38,48,94,.35)}
  .sheet:before{content:"";display:block;height:4px;margin:-16px -18px 12px;border-radius:12px 12px 0 0;background:repeating-linear-gradient(-45deg,#c92f3c 0 10px,#fffaf8 10px 16px,#2f5bb7 16px 26px,#fffaf8 26px 32px)}
  .q{font-weight:600} .a{white-space:pre-line;margin-top:6px}
  img{max-width:100%;border-radius:6px;margin-top:8px}
</style>
</head>
<body><main>
<h1>{{ $th ? 'จดหมายของฉัน' : 'My letters' }}</h1>
<p class="muted">{{ $d['profile']['name'] }} · {{ $th ? 'ส่งออกเมื่อ' : 'Exported' }} {{ $d['exported_at'] }}<br>
{{ $th ? 'มีเฉพาะสิ่งที่คุณเขียนและโพสต์เอง ข้อมูลทั้งหมดอยู่ใน rao-data.json' : 'Only what you wrote and posted yourself. Everything is also in rao-data.json.' }}</p>

<h2>{{ $th ? 'จดหมาย' : 'Letters' }} ({{ count($d['letters']) }})</h2>
@foreach ($d['letters'] as $l)
  <div class="sheet"><div class="muted">{{ $l['date'] }} @if($l['space'])· {{ $l['space'] }}@endif</div>
  <div class="q">{{ $l['question'] }}</div><div class="a">{{ $l['answer'] }}</div></div>
@endforeach

<h2>{{ $th ? 'โปสการ์ด' : 'Postcards' }} ({{ count($d['moments']) }})</h2>
@foreach ($d['moments'] as $m)
  <div class="sheet"><div class="muted">{{ $m['posted_at'] ?? ($th ? 'ฉบับร่าง' : 'Draft') }}</div>
  @if($m['text'])<div class="a">{{ $m['text'] }}</div>@endif
  @foreach ($m['photos'] as $p)<img src="{{ $p }}" alt="">@endforeach</div>
@endforeach

@if (count($d['moods']))
<h2>{{ $th ? 'แสตมป์อารมณ์' : 'Mood stamps' }}</h2>
<div class="sheet">@foreach ($d['moods'] as $m){{ $m['date'] }} · {{ \App\Models\Mood::MOODS[$m['mood']] ?? $m['mood'] }}<br>@endforeach</div>
@endif
</main></body></html>
