alter table voice_practice_sessions
  drop constraint if exists voice_practice_sessions_selected_mode_check;

alter table voice_practice_sessions
  add constraint voice_practice_sessions_selected_mode_check
  check (selected_mode in ('fish', 'gemini_tts', 'gpt_audio_mini', 'gemini_live'));

comment on column voice_practice_sessions.selected_mode is 'Voice renderer used for the session. New hands-free sessions use gemini_tts or fish; legacy values remain for historical sessions.';
