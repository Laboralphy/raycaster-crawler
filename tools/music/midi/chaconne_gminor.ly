\version "2.24.0"
\header {
  title = "Chaconne en sol mineur"
  subtitle = "pour clavecin"
  tagline = ##f
}
\paper { #(set-paper-size "a4") }
global = { \key g \minor \time 3/4 \tempo "Andante" 4 = 76 }
\score {
  \new PianoStaff <<
    \new Staff = "rh" { \global \clef treble
    <g' bes' d''>4 <g' bes' d''>4. es''8 |  % 1
    <f' a' d''>4 <f' a' d''>4. es''8 |  % 2
    <g' c'' es''>4 <g' c'' es''>4. f''8 |  % 3
    <a' d'' fis''>4 <a' d'' fis''>4. g''8 |  % 4
    <bes' es'' g''>4 <bes' es'' g''>4. a''8 |  % 5
    <c'' es'' g''>4 <c'' es'' g''>4. fis''8 |  % 6
    <c'' d'' fis''>4 <c'' d'' fis''>4. g''8 |  % 7
    <bes' d'' g''>4 <bes' d'' g''>2 |  % 8
    \mark \markup \small "Var. 1" d''8 bes'8 d''8 g'8 bes'8 c''8 |  % 9
    d''8 a'8 d''8 f'8 a'8 d''8 |  % 10
    es''8 c''8 es''8 g'8 c''8 f''8 |  % 11
    fis''8 d''8 fis''8 a'8 d''8 fis''8 |  % 12
    g''8 es''8 g''8 bes'8 es''8 f''8 |  % 13
    g''8 es''8 g''8 c''8 es''8 f''8 |  % 14
    fis''8 d''8 fis''8 c''8 d''8 fis''8 |  % 15
    g''8 d''8 g''8 bes'8 d''8 d''8 |  % 16
    \mark \markup \small "Var. 2" d''16 bes'16 g'16 bes'16 d''16 bes'16 g'16 bes'16 d''16 bes'16 g'16 c''16 |  % 17
    d''16 a'16 f'16 a'16 d''16 a'16 f'16 a'16 d''16 a'16 f'16 d''16 |  % 18
    es''16 c''16 g'16 c''16 es''16 c''16 g'16 c''16 es''16 c''16 g'16 f''16 |  % 19
    fis''16 d''16 a'16 d''16 fis''16 d''16 a'16 d''16 fis''16 d''16 a'16 fis''16 |  % 20
    g''16 es''16 bes'16 es''16 g''16 es''16 bes'16 es''16 g''16 es''16 bes'16 f''16 |  % 21
    g''16 es''16 c''16 es''16 g''16 es''16 c''16 es''16 g''16 es''16 c''16 f''16 |  % 22
    fis''16 d''16 c''16 d''16 fis''16 d''16 c''16 d''16 fis''16 d''16 c''16 fis''16 |  % 23
    g''16 d''16 bes'16 d''16 g''16 d''16 bes'16 d''16 g''16 d''16 bes'16 d''16 |  % 24
    \mark \markup \small "Var. 3" <g' bes' d''>4 <g' bes' d''>2 |  % 25
    <f' a' d''>4 <f' a' d''>2 |  % 26
    <g' c'' es''>4 <g' c'' es''>2 |  % 27
    <a' d'' fis''>4 <a' d'' fis''>2 |  % 28
    <bes' es'' g''>4 <bes' es'' g''>2 |  % 29
    <c'' es'' g''>4 <c'' es'' g''>2 |  % 30
    <c'' d'' fis''>4 <c'' d'' fis''>2 |  % 31
    <bes' d'' g''>4 <bes' d'' g''>2 |  % 32
    \mark \markup \small "Var. 4" d''16 es''16 d''16 c''16 bes'16 c''16 bes'16 a'16 g'16 a'16 bes'16 c''16 |  % 33
    d''16 es''16 d''16 c''16 a'16 bes'16 a'16 g'16 f'16 g'16 a'16 bes'16 |  % 34
    es''16 f''16 es''16 d''16 c''16 d''16 c''16 bes'16 g'16 a'16 bes'16 c''16 |  % 35
    fis''16 g''16 fis''16 es''16 d''16 es''16 d''16 c''16 a'16 bes'16 c''16 d''16 |  % 36
    g''16 a''16 g''16 f''16 es''16 f''16 es''16 d''16 bes'16 c''16 d''16 es''16 |  % 37
    g''16 a''16 g''16 f''16 es''16 f''16 es''16 d''16 c''16 d''16 es''16 f''16 |  % 38
    fis''16 g''16 fis''16 es''16 d''16 es''16 d''16 c''16 c''16 d''16 es''16 fis''16 |  % 39
    g''16 a''16 g''16 f''16 d''16 es''16 d''16 c''16 bes'16 c''16 bes'16 a'16 |  % 40
    \mark \markup \small "Var. 5" <g' bes' d''>4 <g' bes' d''>4. es''8 |  % 41
    <f' a' d''>4 <f' a' d''>4. es''8 |  % 42
    <g' c'' es''>4 <g' c'' es''>4. f''8 |  % 43
    <a' d'' fis''>4 <a' d'' fis''>4. g''8 |  % 44
    <bes' es'' g''>4 <bes' es'' g''>4. a''8 |  % 45
    <c'' es'' g''>4 <c'' es'' g''>4. fis''8 |  % 46
    <c'' d'' fis''>4 <c'' d'' fis''>4. g''8 |  % 47
    <bes' d'' g''>4 <bes' d'' g''>2 |  % 48
    \mark \markup \small "Var. 6" d''16 bes'16 g'16 d'16 bes16 g16 bes16 d'16 g'16 bes'16 d''16 bes'16 |  % 49
    d''16 a'16 f'16 d'16 a16 f16 a16 d'16 f'16 a'16 d''16 a'16 |  % 50
    es''16 c''16 g'16 es'16 c'16 g16 c'16 es'16 g'16 c''16 es''16 c''16 |  % 51
    fis''16 d''16 a'16 fis'16 d'16 a16 d'16 fis'16 a'16 d''16 fis''16 d''16 |  % 52
    g''16 es''16 bes'16 g'16 es'16 bes16 es'16 g'16 bes'16 es''16 g''16 es''16 |  % 53
    g''16 es''16 c''16 g'16 es'16 c'16 es'16 g'16 c''16 es''16 g''16 es''16 |  % 54
    fis''16 d''16 c''16 fis'16 d'16 c'16 d'16 fis'16 c''16 d''16 fis''16 d''16 |  % 55
    g''16 d''16 bes'16 g'16 d'16 bes16 d'16 g'16 bes'16 d''16 g''16 d''16 |  % 56
    \mark \markup \small "Var. 7" <g' bes' d''>4 <g' bes' d''>4. es''8 |  % 57
    <f' a' d''>4 <f' a' d''>4. es''8 |  % 58
    <g' c'' es''>4 <g' c'' es''>4. f''8 |  % 59
    <a' d'' fis''>4 <a' d'' fis''>4. g''8 |  % 60
    <bes' es'' g''>4 <bes' es'' g''>4. a''8 |  % 61
    <c'' es'' g''>4 <c'' es'' g''>4. fis''8 |  % 62
    <c'' d'' fis''>4 <c'' d'' fis''>4. g''8 |  % 63
    <g' b' d''>4 <g' b' d''>2\fermata \bar "|."  % 64
    }
    \new Staff = "lh" { \global \clef bass
    g,2. |  % 1
    f,2. |  % 2
    es,2. |  % 3
    d,2. |  % 4
    es,2. |  % 5
    c,2. |  % 6
    d,2. |  % 7
    g,2. |  % 8
    \mark \markup \small "Var. 1" g,4 bes,4 g4 |  % 9
    f,4 a,4 f4 |  % 10
    es,4 g,4 es4 |  % 11
    d,4 fis,4 d4 |  % 12
    es,4 g,4 es4 |  % 13
    c,4 es,4 c4 |  % 14
    d,4 fis,4 d4 |  % 15
    g,4 bes,4 g4 |  % 16
    \mark \markup \small "Var. 2" g,2 g4 |  % 17
    f,2 f4 |  % 18
    es,2 es4 |  % 19
    d,2 d4 |  % 20
    es,2 es4 |  % 21
    c,2 c4 |  % 22
    d,2 d4 |  % 23
    g,2 g4 |  % 24
    \mark \markup \small "Var. 3" g,8 bes,8 d8 bes,8 g,8 g,8 |  % 25
    f,8 a,8 d8 a,8 f,8 f,8 |  % 26
    es,8 g,8 c8 g,8 es,8 es,8 |  % 27
    d,8 fis,8 a,8 fis,8 d,8 d,8 |  % 28
    es,8 g,8 bes,8 g,8 es,8 d,8 |  % 29
    c,8 es,8 g,8 es,8 c,8 c,8 |  % 30
    d,8 fis,8 a,8 fis,8 d,8 fis,8 |  % 31
    g,8 bes,8 d8 bes,8 g,8 g,8 |  % 32
    \mark \markup \small "Var. 4" g,4 bes,4 g4 |  % 33
    f,4 a,4 f4 |  % 34
    es,4 g,4 es4 |  % 35
    d,4 fis,4 d4 |  % 36
    es,4 g,4 es4 |  % 37
    c,4 es,4 c4 |  % 38
    d,4 fis,4 d4 |  % 39
    g,4 bes,4 g4 |  % 40
    \mark \markup \small "Var. 5" g,16 a,16 g,16 f,16 bes,16 c16 bes,16 a,16 g16 f16 es16 d16 |  % 41
    f,16 g,16 f,16 es,16 a,16 bes,16 a,16 g,16 f16 es16 d16 c16 |  % 42
    es,16 f,16 es,16 d,16 g,16 a,16 g,16 f,16 es16 d16 c16 bes,16 |  % 43
    d,16 es,16 d,16 c,16 fis,16 g,16 fis,16 es,16 d16 c16 bes,16 a,16 |  % 44
    es,16 f,16 es,16 d,16 g,16 a,16 g,16 f,16 es16 d16 c16 bes,16 |  % 45
    c,16 d,16 c,16 bes,,16 es,16 f,16 es,16 d,16 c16 bes,16 a,16 g,16 |  % 46
    d,16 es,16 d,16 c,16 fis,16 g,16 fis,16 es,16 d16 c16 bes,16 a,16 |  % 47
    g,16 a,16 g,16 f,16 bes,16 c16 bes,16 a,16 g16 a16 g16 f16 |  % 48
    \mark \markup \small "Var. 6" g,8 g8 g,8 g8 g,8 g8 |  % 49
    f,8 f8 f,8 f8 f,8 f8 |  % 50
    es,8 es8 es,8 es8 es,8 es8 |  % 51
    d,8 d8 d,8 d8 d,8 d8 |  % 52
    es,8 es8 es,8 es8 es,8 es8 |  % 53
    c,8 c8 c,8 c8 c,8 c8 |  % 54
    d,8 d8 d,8 d8 d,8 d8 |  % 55
    g,8 g8 g,8 g8 g,8 g8 |  % 56
    \mark \markup \small "Var. 7" <g, g>2. |  % 57
    <f, f>2. |  % 58
    <es, es>2. |  % 59
    <d, d>2. |  % 60
    <es, es>2. |  % 61
    <c, c>2. |  % 62
    <d, d>2. |  % 63
    <g, g>2.\fermata \bar "|."  % 64
    }
  >>
  \layout { }
}
