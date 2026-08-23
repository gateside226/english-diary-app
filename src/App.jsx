import React, { useState, useEffect } from 'react';

export default function EnglishDiaryApp() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState('calendar');
  const [editingId, setEditingId] = useState(null);

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('diaryEntries');
    if (saved) setEntries(JSON.parse(saved));
    // 旧バージョンでブラウザに保存されていたAPIキーが残っていれば削除する
    if (localStorage.getItem('apiKey')) {
      localStorage.removeItem('apiKey');
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  // Claude APIでタグ分類（サーバーサイドの /api/classify 経由。APIキーはブラウザに一切渡らない）
  const classifyTags = async (entryText) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entryText })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data.tags) ? data.tags : [];
    } catch (error) {
      console.error('タグ分類エラー:', error);
      alert('⚠️ タグ分類に失敗しました。しばらくしてからもう一度お試しください。');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 日記エントリを追加
  const handleAddEntry = async () => {
    if (!text.trim()) {
      alert('📝 テキストを入力してください');
      return;
    }

    const classifiedTags = await classifyTags(text);
    
    if (editingId) {
      setEntries(entries.map(e => 
        e.id === editingId 
          ? { ...e, text, date, tags: classifiedTags, updatedAt: new Date().toISOString() }
          : e
      ));
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        date,
        text,
        tags: classifiedTags,
        wordCount: text.split(/\s+/).length,
        createdAt: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
    }

    setText('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // 継続日数を計算
  const getStreakCount = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // カレンダーを生成
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEntry = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.some(e => e.date === dateStr);
  };

  // 統計情報を計算
  const stats = {
    totalEntries: entries.length,
    totalWords: entries.reduce((sum, e) => sum + e.wordCount, 0),
    averageWords: entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length) : 0,
    uniqueDates: new Set(entries.map(e => e.date)).size,
    mostUsedTag: entries.flatMap(e => e.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {})
  };

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(224, 231, 255))', padding: '1rem' }}>
      <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
        {/* ヘッダー */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'rgb(17, 24, 39)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>📚</span> English Diary
          </h1>
          <p style={{ color: 'rgb(75, 85, 99)' }}>自然な英語表現を身につけるための継続日記</p>
        </div>

        {/* ストリークカウンター */}
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🔥</span>
              <div>
                <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>現在のストリーク</p>
                <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'rgb(249, 115, 22)' }}>{getStreakCount()}</p>
                <p style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>日間継続中</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'right' }}>
              <div>
                <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.75rem' }}>投稿数</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(37, 99, 235)' }}>{stats.totalEntries}</p>
              </div>
              <div>
                <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.75rem' }}>総語数</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(79, 70, 229)' }}>{stats.totalWords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* タブメニュー */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgb(229, 231, 235)' }}>
          <button
            onClick={() => setView('calendar')}
            style={{ padding: '0.75rem 1rem', fontWeight: '600', borderBottom: view === 'calendar' ? '2px solid rgb(59, 130, 246)' : 'none', color: view === 'calendar' ? 'rgb(37, 99, 235)' : 'rgb(75, 85, 99)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            📅 カレンダー
          </button>
          <button
            onClick={() => setView('list')}
            style={{ padding: '0.75rem 1rem', fontWeight: '600', borderBottom: view === 'list' ? '2px solid rgb(59, 130, 246)' : 'none', color: view === 'list' ? 'rgb(37, 99, 235)' : 'rgb(75, 85, 99)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            🏷️ 投稿一覧
          </button>
          <button
            onClick={() => setView('stats')}
            style={{ padding: '0.75rem 1rem', fontWeight: '600', borderBottom: view === 'stats' ? '2px solid rgb(59, 130, 246)' : 'none', color: view === 'stats' ? 'rgb(37, 99, 235)' : 'rgb(75, 85, 99)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            📊 統計
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 2fr' : '1fr', gap: '2rem' }}>
          {/* 入力フォーム */}
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ➕ 新しい日記
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'rgb(55, 65, 81)', marginBottom: '0.5rem' }}>
                  日付
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid rgb(209, 213, 219)', borderRadius: '0.375rem', outline: 'none', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'rgb(55, 65, 81)', marginBottom: '0.5rem' }}>
                  日記（50語程度）
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="英語で今日の出来事を書いてください..."
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(209, 213, 219)', borderRadius: '0.375rem', outline: 'none', height: '120px', fontSize: '1rem', fontFamily: 'inherit', resize: 'none' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', marginTop: '0.5rem' }}>
                  {text.split(/\s+/).filter(w => w).length} / 50 単語
                </p>
              </div>

              <button
                onClick={handleAddEntry}
                disabled={isLoading}
                style={{ width: '100%', padding: '0.75rem 1rem', background: isLoading ? 'rgb(156, 163, 175)' : 'rgb(37, 99, 235)', color: 'white', fontWeight: '600', borderRadius: '0.375rem', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
              >
                {isLoading ? '🤖 分類中...' : '✨ 投稿'}
              </button>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            {view === 'calendar' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: '600', color: 'rgb(75, 85, 99)', fontSize: '0.875rem', padding: '0.5rem' }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      style={{
                        aspectRatio: '1 / 1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: day ? 'pointer' : 'default',
                        background: day === null ? 'rgb(243, 244, 246)' : hasEntry(day) ? 'rgb(59, 130, 246)' : 'rgb(243, 244, 246)',
                        color: hasEntry(day) ? 'white' : 'rgb(156, 163, 175)',
                        boxShadow: hasEntry(day) ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    style={{ padding: '0.5rem 1rem', background: 'rgb(229, 231, 235)', color: 'rgb(55, 65, 81)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    ← 前月
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    style={{ padding: '0.5rem 1rem', background: 'rgb(59, 130, 246)', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    今月
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    style={{ padding: '0.5rem 1rem', background: 'rgb(229, 231, 235)', color: 'rgb(55, 65, 81)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    次月 →
                  </button>
                </div>
              </div>
            )}

            {view === 'list' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>投稿一覧</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {entries.length === 0 ? (
                    <p style={{ color: 'rgb(107, 114, 128)', textAlign: 'center', padding: '2rem' }}>まだ日記がありません</p>
                  ) : (
                    entries.map(entry => (
                      <div key={entry.id} style={{ border: '1px solid rgb(229, 231, 235)', borderRadius: '0.375rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'box-shadow 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: 'rgb(17, 24, 39)' }}>{entry.date}</p>
                            <p style={{ fontSize: '0.875rem', color: 'rgb(107, 114, 128)' }}>{entry.wordCount} 単語</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setText(entry.text);
                                setDate(entry.date);
                                setEditingId(entry.id);
                              }}
                              style={{ padding: '0.5rem', color: 'rgb(59, 130, 246)', background: 'white', border: 'none', cursor: 'pointer', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                              style={{ padding: '0.5rem', color: 'rgb(239, 68, 68)', background: 'white', border: 'none', cursor: 'pointer', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <p style={{ color: 'rgb(55, 65, 81)', marginBottom: '0.75rem' }}>{entry.text}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {entry.tags.map(tag => (
                            <span key={tag} style={{ display: 'inline-block', background: 'rgb(219, 234, 254)', color: 'rgb(30, 58, 138)', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {view === 'stats' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>統計情報</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgb(239, 246, 255)', borderRadius: '0.375rem', padding: '1rem' }}>
                    <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>投稿数</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(37, 99, 235)' }}>{stats.totalEntries}</p>
                  </div>
                  <div style={{ background: 'rgb(238, 242, 255)', borderRadius: '0.375rem', padding: '1rem' }}>
                    <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>平均単語数</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(79, 70, 229)' }}>{stats.averageWords}</p>
                  </div>
                  <div style={{ background: 'rgb(240, 253, 250)', borderRadius: '0.375rem', padding: '1rem' }}>
                    <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>総語数</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(16, 185, 129)' }}>{stats.totalWords}</p>
                  </div>
                  <div style={{ background: 'rgb(250, 245, 255)', borderRadius: '0.375rem', padding: '1rem' }}>
                    <p style={{ color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>投稿日数</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(126, 34, 206)' }}>{stats.uniqueDates}</p>
                  </div>
                </div>

                <div style={{ background: 'rgb(249, 250, 251)', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontWeight: '600', color: 'rgb(17, 24, 39)', marginBottom: '0.75rem' }}>よく使うタグ</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(stats.mostUsedTag)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([tag, count]) => (
                        <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: '600', color: 'rgb(59, 130, 246)', width: '80px' }}>{tag}</span>
                          <div style={{ flex: 1, background: 'rgb(191, 219, 254)', borderRadius: '9999px', height: '8px', width: `${(count / stats.totalEntries) * 100}%` }}></div>
                          <span style={{ fontSize: '0.875rem', color: 'rgb(75, 85, 99)', width: '40px' }}>{count}回</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div style={{ marginTop: '3rem', textAlign: 'center', color: 'rgb(75, 85, 99)', fontSize: '0.875rem' }}>
          <p>💾 データはブラウザのローカルストレージに自動保存されています</p>
          <p style={{ marginTop: '0.5rem' }}>🔒 APIキーはサーバー側で安全に管理されており、ブラウザには一切保存されません</p>
        </div>
      </div>
    </div>
  );
}
