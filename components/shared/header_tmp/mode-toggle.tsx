/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import {useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuSeparator, DropdownMenuTrigger,DropdownMenuContent, DropdownMenuLabel, DropdownMenuCheckboxItem  } from "@/components/ui/dropdown-menu";
import {useTheme} from "next-themes";
import {SunIcon, MoonIcon, SunMoon } from 'lucide-react';


const ModeToggle = () => {
    // ThemeProvider을 쓰면 서버사이드 렌더링을할때는 가지고 있지 않는 값때문에 문제가 있을수 있다. use client랑 Mount패턴으로 클라이언트사이드 렌더링일 경우만 처리
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }


    return ( 
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='focus-visible:ring-0 focus-visible:ring-offset-0'
        >
          {theme === 'system' ? (
            <SunMoon />
          ) : theme === 'dark' ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onClick={() => setTheme('system')}
        >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onClick={() => setTheme('light')}
        >
          Light
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
    );
}
 
export default ModeToggle;