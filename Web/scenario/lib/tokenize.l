%option 7bit

NL          \r\n|\r|\n

NOTNL		[^\r\n]
ANYCHAR		[^[:space:]\\]
BLANK 		[[:blank:]]
ALPHA		[[:alpha:]]
ALNUM_		[[:alnum:]_]
DIGIT		[[:digit:]]
HEX			[[:xdigit:]]
OCT			[0-7]
V0123		[0-3]
CCLCC		[^\\\]\r\n]
OPERATOR	[\*\+\?\.\(\)\{\}\|]

NAME		{ALPHA}{ALNUM_}*
NAME2       {NAME}\.{NAME}
NUMBER		{DIGIT}+

ESCSEQ		\\({OCT}{1,2}|{V0123}{OCT}{2}|x{HEX}{1,2}|u{HEX}{4}|U{HEX}{6}|{NOTNL})
CCLCHAR		{CCLCC}|{ESCSEQ}

%x SC_MCOMM SC_SCOMM SC_REGEXP SC_RE_QUOT SC_RE_CCL

%%

<SC_MCOMM>{
    "*/"            BEGIN(INITIAL);
    {NL}
}

<SC_SCOMM>{
    {NL}            BEGIN(INITIAL);
}

<SC_MCOMM,SC_SCOMM>{
    {NOTNL}
}

<SC_REGEXP>{
    \/                          BEGIN(INITIAL);
    \"                          BEGIN(SC_RE_QUOT);
    \[\^?                       BEGIN(SC_RE_CCL);
    "{"{NAME}"}"
    "{"{NAME2}"}"
    {OPERATOR}
    "{"{NUMBER}\,?"}"
    "{"{NUMBER}\,{NUMBER}"}"
}

<SC_RE_QUOT>{
    \"                          BEGIN(SC_REGEXP);
    {BLANK}
}

<SC_REGEXP,SC_RE_QUOT>{
    {ESCSEQ}
    {ANYCHAR}
}

<SC_RE_CCL>{
    \]                          BEGIN(SC_REGEXP);
    "[:"{NAME}":]"
    "[:"{NAME2}":]"
    {CCLCHAR}
    {CCLCHAR}-{CCLCHAR}
}

{NL}
[[:space:]]
"/*"            BEGIN(SC_MCOMM);
"//"            BEGIN(SC_SCOMM);
\/\^?           BEGIN(SC_REGEXP);

"%package"
"%scenario"
"%state"
"%event"
"%group"
"%define"
"%action"
"%export"

[yY][yY]{ALNUM_}*
{NAME}
[\{\}\.\,\<\>]

