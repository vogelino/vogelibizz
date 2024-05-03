"use client"
import { useNavigation } from '@refinedev/core';
import { Button } from '../ui/button';

function ResourceButton({
  resource,
  action: actionName
}: {
  resource: string,
  action: keyof Pick<ReturnType<typeof useNavigation>, 'create' | 'show' | 'edit'>
}) {
  const navigation = useNavigation()
  const action = navigation[actionName];
  return (
    <Button variant="outline" onClick={() => action(resource, 'push')}>
      {ucFirst(actionName)} {resource.toLocaleLowerCase().replace(/s$/, "")}
    </Button>
  )
}

function ucFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default ResourceButton
